# v4.0.0 Implementation Checklist

## Overview

This document consolidates all decisions from the analysis phase into a concrete implementation plan for v4.0.0.

**Target Release**: v4.0.0-alpha.1 → v4.0.0-alpha.2 → v4.0.0-beta.0 → v4.0.0 stable

**Timeline**: 4-6 weeks total

---

## Phase 1: v4.0.0-alpha.1 (Core Features)

### 1.1 Type Signature Changes

**File**: `packages/unit/src/testbed.ts`

**Change**: Remove type constraint that forces `.expose()` first

```typescript
// BEFORE (line 69-75):
public static sociable<TClass = any>(
  targetClass: Type<TClass>
): Pick<SociableTestBedBuilder<TClass>, 'expose'> {
  return testBedBuilderFactory(SuitesDIAdapters, SuitesDoublesAdapters, targetClass).create(
    SociableTestBedBuilderCore<TClass>
  );
}

// AFTER:
public static sociable<TClass = any>(
  targetClass: Type<TClass>
): SociableTestBedBuilder<TClass> {
  return testBedBuilderFactory(SuitesDIAdapters, SuitesDoublesAdapters, targetClass).create(
    SociableTestBedBuilderCore<TClass>
  );
}
```

**Rationale**: Allows `.boundaries()`, `.mock()`, and `.compile()` to be called without `.expose()` first

**Breaking**: NO (expands API, doesn't restrict it)

### 1.2 Add `.boundaries()` Method

**File**: `packages/core/src/services/builders/sociable-unit-builder.ts`

**Add method**:

```typescript
/**
 * Declares dependencies as boundaries - they will be mocked with default spy behavior
 * and traversal will stop at these points in the dependency graph.
 *
 * Boundaries are useful for:
 * - Performance: Expensive dependencies to instantiate
 * - Stability: Flaky or non-deterministic dependencies
 * - Scope: Limiting the blast radius of the unit test
 * - Integration points: Third-party services or external systems
 *
 * Note: Token injections (@Inject('TOKEN')) are automatically treated as boundaries.
 *
 * @param classes Array of classes to treat as boundaries
 * @returns The builder for chaining
 *
 * @example
 * TestBed.sociable(UserService)
 *   .expose(AuthService)
 *   .boundaries([CacheService, NotificationService])
 *   .compile();
 */
public boundaries(classes: Type[]): this {
  // Merge with existing boundaries (allow multiple calls)
  this.boundaryClasses = [...this.boundaryClasses, ...classes];
  return this;
}
```

**Add property** to builder class:

```typescript
private boundaryClasses: Type[] = [];
```

**Pass to options**:

```typescript
// In compile() method, pass boundaries to DependencyResolver
const options = {
  boundaries: this.boundaryClasses,
  // ... other options
};
```

### 1.3 Implement Fail-Fast

**File**: `packages/core/src/services/dependency-resolver.ts`

**Modify**: `resolveOrMock()` method to throw on undeclared dependencies

```typescript
// Current logic (lines ~46-70):
private resolveOrMock(identifier: InjectableIdentifier): any {
  // Step 1: Check for custom mock (.impl() or .final())
  const existingMock = this.mockedFromBeforeContainer.resolve(identifier);
  if (existingMock !== undefined) {
    return existingMock;
  }

  // Step 2: Check if exposed
  if (this.classesToExpose.includes(identifier)) {
    return this.instantiateClass(identifier);
  }

  // Step 3: Check if boundary (NEW)
  if (this.options.boundaries?.includes(identifier)) {
    const mock = this.mockFunction();
    return mock;
  }

  // Step 4: Check if mock() was called without impl/final (NEW)
  if (this.mockedFromBeforeContainer.has(identifier)) {
    const mock = this.mockFunction();
    return mock;
  }

  // Step 5: FAIL-FAST (NEW - replaces silent undefined)
  const identifierName = typeof identifier === 'function'
    ? identifier.name
    : String(identifier);

  throw new Error(
    `Dependency '${identifierName}' was accessed but not configured.\n` +
    `\n` +
    `In sociable tests, all dependencies must be explicitly declared:\n` +
    `  - .expose(${identifierName}) - to use real instance (traverse dependencies)\n` +
    `  - .boundaries([${identifierName}]) - to mock with default behavior (stop traversal)\n` +
    `  - .mock(${identifierName}).impl(...) - to mock with custom behavior\n` +
    `\n` +
    `This ensures tests are explicit about their dependency strategy and prevents\n` +
    `silent failures when dependencies return undefined.`
  );
}
```

**Add escape hatch** (temporary, for migration):

```typescript
// In builder class:
private failFastDisabled: boolean = false;

public disableFailFast(): this {
  this.failFastDisabled = true;
  console.warn(
    '⚠️ Warning: .disableFailFast() is a temporary migration helper.\n' +
    'It will be removed in v5.0.0.\n' +
    'Update your tests to explicitly declare all dependencies.'
  );
  return this;
}

// In dependency-resolver.ts:
// Step 5: FAIL-FAST (unless disabled)
if (!this.options.failFastDisabled) {
  throw new Error(...);
}

// If disabled, return undefined (old behavior)
return undefined;
```

### 1.4 Validation: Conflict Detection

**File**: `packages/core/src/services/builders/sociable-unit-builder.ts`

**Add method**: `validateConfiguration()` called from `compile()`

```typescript
private validateConfiguration(): void {
  const exposedSet = new Set(this.classesToExpose);
  const boundarySet = new Set(this.boundaryClasses);
  const mockedIdentifiers = [
    ...this.identifiersToBeMocked.map(([id]) => id),
    ...this.identifiersToBeFinalized.map(([id]) => id)
  ];

  // ERROR: expose + mock conflict
  mockedIdentifiers.forEach(id => {
    if (typeof id === 'function' && exposedSet.has(id)) {
      throw new Error(
        `Configuration conflict for '${id.name}':\n` +
        `Cannot both expose() and mock() the same dependency.\n` +
        `  - expose() = use real instance (traverse dependencies)\n` +
        `  - mock() = use fake instance (don't traverse)\n` +
        `Remove either the expose() or mock() call for '${id.name}'.`
      );
    }
  });

  // ERROR: expose + boundaries conflict
  exposedSet.forEach(cls => {
    if (boundarySet.has(cls)) {
      throw new Error(
        `Configuration conflict for '${cls.name}':\n` +
        `Cannot both expose() and declare as boundary.\n` +
        `  - expose() = use real instance\n` +
        `  - boundaries() = mock with default behavior\n` +
        `Remove '${cls.name}' from either expose() or boundaries().`
      );
    }
  });

  // WARNING: boundaries + mock redundancy
  mockedIdentifiers.forEach(id => {
    if (typeof id === 'function' && boundarySet.has(id)) {
      console.warn(
        `⚠️ Redundant configuration for '${id.name}':\n` +
        `Declared in both boundaries() and mock().\n` +
        `The boundaries() declaration has no effect - mock() already treats it as a boundary.\n` +
        `Tip: Remove '${id.name}' from boundaries() to clean up your test setup.`
      );
    }
  });
}

public async compile(): Promise<UnitTestBed<TClass>> {
  this.validateConfiguration(); // Call before compilation
  // ... rest of compile logic
}
```

### 1.5 Update JSDoc

**File**: `packages/unit/src/testbed.ts`

**Update**: JSDoc for `sociable()` method (lines 47-75)

```typescript
/**
 * @description
 * Initializes a sociable test environment builder for a specified class. In a sociable environment,
 * dependencies can be either real or mocked based on test requirements.
 *
 * Configuration options:
 * - `.expose()` - Make dependencies real instances (traverse their dependencies)
 * - `.boundaries()` - Mock dependencies with default behavior (don't traverse)
 * - `.mock()` - Mock dependencies with custom behavior
 *
 * With fail-fast enabled (default in v4.0.0), accessing non-configured dependencies throws an error,
 * ensuring tests explicitly declare their dependency strategy.
 *
 * @since 3.0.0
 * @template TClass The type of the class to be tested.
 * @param {Type<TClass>} targetClass The class for which the test environment is constructed.
 * @returns A builder to configure the sociable test environment
 *
 * @example
 * // Sociable test with real dependencies
 * const { unit } = await TestBed.sociable(MyService)
 *   .expose(DependencyOne)
 *   .expose(DependencyTwo)
 *   .compile();
 *
 * @example
 * // Sociable test with boundaries
 * const { unit } = await TestBed.sociable(MyService)
 *   .expose(CoreService)
 *   .boundaries([CacheService, QueueService])
 *   .compile();
 *
 * @example
 * // Isolation test (all dependencies mocked)
 * const { unit } = await TestBed.sociable(MyService)
 *   .boundaries([DepA, DepB, DepC])
 *   .compile();
 *
 * @see https://suites.dev/docs
 */
public static sociable<TClass = any>(
  targetClass: Type<TClass>
): SociableTestBedBuilder<TClass> {
  // implementation
}
```

---

## Phase 2: v4.0.0-alpha.2 (Polish & Testing)

### 2.1 Enhanced Error Messages

**Improve fail-fast error** to include context:

```typescript
throw new Error(
  `Dependency '${identifierName}' was accessed in ${this.targetClass.name} but not configured.\n` +
  `\n` +
  `Context: ${this.targetClass.name} depends on:\n` +
  `${this.getDependencyList().map(d => `  - ${d.name}`).join('\n')}\n` +
  `\n` +
  `Configured dependencies:\n` +
  `  Exposed: ${this.classesToExpose.map(c => c.name).join(', ') || '(none)'}\n` +
  `  Boundaries: ${this.boundaryClasses.map(c => c.name).join(', ') || '(none)'}\n` +
  `  Mocked: ${mockedIdentifiers.filter(id => typeof id === 'function').map(id => id.name).join(', ') || '(none)'}\n` +
  `\n` +
  `To fix, declare '${identifierName}':\n` +
  `  - .expose(${identifierName}) - to use real instance\n` +
  `  - .boundaries([${identifierName}]) - to mock with default behavior\n` +
  `  - .mock(${identifierName}).impl(...) - to mock with custom behavior`
);
```

### 2.2 Warning for Empty Configuration

**Add warning** in `compile()` if no dependencies configured:

```typescript
public async compile(): Promise<UnitTestBed<TClass>> {
  this.validateConfiguration();

  // Warn if nothing configured
  if (
    this.classesToExpose.length === 0 &&
    this.boundaryClasses.length === 0 &&
    this.identifiersToBeMocked.length === 0 &&
    this.identifiersToBeFinalized.length === 0
  ) {
    console.warn(
      '⚠️ Sociable test with no configuration.\n' +
      'All dependencies will fail-fast when accessed.\n' +
      'This is valid for isolation testing, but usually you want:\n' +
      '  .expose([...]) - for real dependencies\n' +
      '  .boundaries([...]) - for mocked dependencies'
    );
  }

  // ... rest of compile logic
}
```

### 2.3 E2E Tests

**Create test file**: `e2e/jest/nestjs/boundaries-fail-fast.e2e.spec.ts`

```typescript
import { TestBed } from '@suites/unit/dist/esm';
import { UserService, AuthService, CacheService, NotificationService } from './test-assets';

describe('Boundaries and Fail-Fast (v4.0.0)', () => {
  describe('boundaries()', () => {
    it('should mock dependencies declared as boundaries', async () => {
      const { unit, unitRef } = await TestBed.sociable(UserService)
      .expose(AuthService)
      .boundaries([CacheService])
      .compile();

      // CacheService is mocked (boundary)
      const cache = unitRef.get(CacheService);
      expect(cache.get).toBeDefined();
      expect(typeof cache.get).toBe('function');
    });

    it('should allow multiple boundaries() calls (merge)', async () => {
      const { unit } = await TestBed.sociable(UserService)
      .boundaries([CacheService])
      .boundaries([NotificationService])
      .compile();

      // Both should be mocked
      expect(unit).toBeDefined();
    });
  });

  describe('fail-fast', () => {
    it('should throw when accessing non-configured dependency', async () => {
      const { unit } = await TestBed.sociable(UserService)
      .expose(AuthService)
      // NotificationService not configured
      .compile();

      // Accessing NotificationService should fail-fast
      await expect(
        unit.sendNotification('test')
      ).rejects.toThrow(
        "Dependency 'NotificationService' was accessed but not configured"
      );
    });

    it('should allow disableFailFast() as escape hatch', async () => {
      const { unit } = await TestBed.sociable(UserService)
      .expose(AuthService)
      .disableFailFast()
      .compile();

      // NotificationService returns undefined (old behavior)
      const result = await unit.sendNotification('test');
      expect(result).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should throw on expose + mock conflict', async () => {
      await expect(
        TestBed.sociable(UserService)
        .expose(CacheService)
        .mock(CacheService).impl(() => ({}))
        .compile()
      ).rejects.toThrow(
        "Configuration conflict for 'CacheService':\nCannot both expose() and mock()"
      );
    });

    it('should throw on expose + boundaries conflict', async () => {
      await expect(
        TestBed.sociable(UserService)
        .expose(CacheService)
        .boundaries([CacheService])
        .compile()
      ).rejects.toThrow(
        "Configuration conflict for 'CacheService':\nCannot both expose() and declare as boundary"
      );
    });

    it('should warn on boundaries + mock redundancy', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await TestBed.sociable(UserService)
      .boundaries([CacheService])
      .mock(CacheService).impl(() => ({}))
      .compile();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Redundant configuration for 'CacheService'")
      );

      warnSpy.mockRestore();
    });
  });
});
```

---

## Phase 3: v4.0.0-beta.0 (Beta Testing)

### 3.1 Migration Testing

**Test migration scenarios**:

1. Existing v3.x tests with `.expose()` only → Should work unchanged
2. Tests that relied on undefined behavior → Should fail with clear errors
3. Tests using `.disableFailFast()` → Should work with warnings

### 3.2 Real-World Testing

**Invite beta testers**:
- QozbroQqn's team (discussion #655)
- Other production users
- Internal projects

**Collect feedback on**:
- Error message clarity
- API ergonomics
- Migration pain points

### 3.3 Documentation

**Create migration guide**: `MIGRATION_v4.md`

**Document**:
1. Type signature change (non-breaking but expands API)
2. Fail-fast behavior (breaking - tests may fail)
3. New `.boundaries()` API
4. Validation errors and how to fix
5. `.disableFailFast()` escape hatch (temporary)

---

## Phase 4: v4.0.0 Stable

### 4.1 Final Polish

- Review all error messages based on beta feedback
- Update all documentation
- Create video tutorials
- Update website examples

### 4.2 Release Notes

**Highlight**:
1. **Fail-Fast (Breaking)**: Non-configured dependencies now throw errors instead of returning undefined
2. **New `.boundaries()` API**: Batch declare mocked dependencies
3. **Type Signature Expansion**: All builder methods available immediately (non-breaking)
4. **Better Validation**: Detects conflicts between expose/mock/boundaries
5. **Migration Helper**: `.disableFailFast()` for gradual migration

### 4.3 Deprecation Notices

**Document deprecations** for future removal:
- `.disableFailFast()` → Will be removed in v5.0.0

---

## Summary of Changes by File

### Core Changes

| File | Changes | Breaking |
|------|---------|----------|
| `packages/unit/src/testbed.ts` | Remove `Pick<..., 'expose'>` constraint | NO |
| `packages/core/src/services/builders/sociable-unit-builder.ts` | Add `.boundaries()` method | NO |
| `packages/core/src/services/builders/sociable-unit-builder.ts` | Add `validateConfiguration()` | NO |
| `packages/core/src/services/builders/sociable-unit-builder.ts` | Add `.disableFailFast()` | NO |
| `packages/core/src/services/dependency-resolver.ts` | Implement fail-fast in `resolveOrMock()` | YES |
| `packages/core/src/services/dependency-resolver.ts` | Add boundaries check | NO |

### Test Changes

| File | Changes |
|------|---------|
| `e2e/jest/nestjs/boundaries-fail-fast.e2e.spec.ts` | New test file for v4.0.0 features |
| Existing e2e tests | May need updates if they relied on undefined behavior |

### Documentation Changes

| File | Changes |
|------|---------|
| `MIGRATION_v4.md` | New migration guide |
| `packages/unit/src/testbed.ts` | Updated JSDoc for `.sociable()` |
| Website docs | Updated examples and API reference |

---

## Timeline

**Total: 4-6 weeks**

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1 | 1-2 weeks | v4.0.0-alpha.1 with core features |
| Phase 2 | 1 week | v4.0.0-alpha.2 with polish and tests |
| Phase 3 | 1-2 weeks | v4.0.0-beta.0 with real-world testing |
| Phase 4 | 1 week | v4.0.0 stable with docs |

---

## Risk Mitigation

### Risk 1: Breaking Changes Too Disruptive

**Mitigation**:
- `.disableFailFast()` escape hatch for gradual migration
- Clear error messages with fix suggestions
- Comprehensive migration guide

### Risk 2: Performance Impact

**Mitigation**:
- Validation only runs once at compile time
- Fail-fast check is simple Set lookup
- No runtime overhead for happy path

### Risk 3: User Confusion

**Mitigation**:
- Clear JSDoc with examples
- Video tutorials
- Beta testing with real users
- Active support during migration period

---

## Open Questions

1. **Should `.boundaries()` be chainable per-class like `.expose()`?**
   ```typescript
   .boundaries(A).boundaries(B)
   // vs
   .boundaries([A, B])
   ```
   **Decision**: Support both (single class and array)

2. **Should we add `.exposeAll()` in v4.0.0 or v4.1.0?**
   **Decision**: v4.1.0 (non-breaking, can be added later)

3. **Should fail-fast be opt-in or opt-out?**
   **Decision**: Opt-out via `.disableFailFast()` (fail-fast is default)

---

## Success Criteria

### Technical
- [ ] All e2e tests pass
- [ ] Type checking works for all scenarios
- [ ] Error messages are clear and actionable
- [ ] Performance regression < 5%

### User Experience
- [ ] Beta testers successfully migrate
- [ ] No critical bugs reported in beta
- [ ] Documentation is comprehensive
- [ ] Migration guide covers common scenarios

### Adoption
- [ ] QozbroQqn's team adopts v4.0.0
- [ ] At least 3 other teams test beta
- [ ] No requests to revert fail-fast behavior

---

## Post-Release (v4.1.0 Planning)

**Non-breaking additions** for v4.1.0:
1. `.exposeAll()` / `.mode('all')` API
2. Auto-boundary detection for I/O services
3. Better TypeScript inference for mocks
4. Performance optimizations

**No breaking changes** in v4.1.0 - all must be compatible with v4.0.0.