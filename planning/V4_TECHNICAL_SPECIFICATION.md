# v4.0.0 Technical Specification

## API Specification

### New Methods

#### `.boundaries(dependencies: Type[])`

```typescript
interface SociableTestBedBuilder<TClass> {
  boundaries(dependencies: Type[]): SociableTestBedBuilder<TClass>;
}
```

**Purpose**: Declares dependencies to mock, auto-exposing everything else.

**Parameters**:
- `dependencies`: Array of classes to treat as boundaries (will be mocked)

**Returns**: Builder instance for chaining

**Behavior**:
1. Sets mode to 'boundaries'
2. Enables fail-fast automatically
3. Stores boundary classes for resolution
4. Throws if `.expose()` was called before

**Example**:
```typescript
TestBed.sociable(UserService)
  .boundaries([DatabaseService, HttpClient])
  .compile();
```

#### `.disableFailFast()`

```typescript
interface TestBedBuilder<TClass> {
  disableFailFast(): TestBedBuilder<TClass>;
}
```

**Purpose**: Disables fail-fast behavior (migration helper).

**Returns**: Builder instance for chaining

**Behavior**:
1. Sets fail-fast flag to false
2. Logs deprecation warning
3. Restores v3.x undefined behavior

**Example**:
```typescript
TestBed.sociable(UserService)
  .expose(AuthService)
  .disableFailFast() // Temporary for migration
  .compile();
```

### Modified Methods

#### `TestBed.sociable()`

**Change**: Remove type constraint that forces `.expose()` first.

**Before** (v3.x):
```typescript
public static sociable<TClass>(
  targetClass: Type<TClass>
): Pick<SociableTestBedBuilder<TClass>, 'expose'>
```

**After** (v4.0):
```typescript
public static sociable<TClass>(
  targetClass: Type<TClass>
): SociableTestBedBuilder<TClass>
```

## Implementation Details

### File Changes

#### 1. packages/unit/src/testbed.ts

```typescript
// Line 69-75: Remove type constraint
public static sociable<TClass = any>(
  targetClass: Type<TClass>
): SociableTestBedBuilder<TClass> { // Changed from Pick<..., 'expose'>
  return testBedBuilderFactory(/*...*/).create(
    SociableTestBedBuilderCore<TClass>
  );
}
```

#### 2. packages/core/src/services/builders/sociable-unit-builder.ts

```typescript
export class SociableTestBedBuilder<TClass> extends TestBedBuilder<TClass> {
  private readonly classesToExpose: Type[] = [];
  private boundaryClasses: Type[] = []; // NEW
  private mode: 'expose' | 'boundaries' | null = null; // NEW
  private failFastEnabled: boolean = true; // NEW - default ON

  public boundaries(dependencies: Type[]): this {
    if (this.mode === 'expose') {
      throw new Error(
        'Cannot use .boundaries() after .expose().\n' +
        'These represent opposite testing strategies:\n' +
        '  - .expose(): Start with all mocked, selectively make real\n' +
        '  - .boundaries(): Start with all real, selectively mock boundaries\n' +
        'Choose one approach for your test.'
      );
    }
    this.mode = 'boundaries';
    this.boundaryClasses = dependencies;
    return this;
  }

  public expose(dependency: Type): this {
    if (this.mode === 'boundaries') {
      throw new Error(
        'Cannot use .expose() after .boundaries().\n' +
        'These represent opposite testing strategies.'
      );
    }
    this.mode = 'expose';
    this.classesToExpose.push(dependency);
    return this;
  }

  public disableFailFast(): this {
    console.warn(
      '⚠️ Warning: .disableFailFast() is a migration helper.\n' +
      'Consider fixing your tests to explicitly configure all dependencies.\n' +
      'This method will be removed in v5.0.0.'
    );
    this.failFastEnabled = false;
    return this;
  }

  public async compile(): Promise<UnitTestBed<TClass>> {
    // Pass configuration to resolver
    const options = {
      mode: this.mode,
      boundaryClasses: this.boundaryClasses,
      failFastEnabled: this.failFastEnabled,
      autoExposeEnabled: this.mode === 'boundaries'
    };

    // ... existing compilation logic with options
  }
}
```

#### 3. packages/core/src/services/dependency-resolver.ts

```typescript
export class DependencyResolver {
  constructor(
    private readonly classesToExpose: Type[],
    private readonly mockedFromBeforeContainer: DependencyContainer,
    private readonly adapter: DependencyInjectionAdapter,
    private readonly mockFunction: MockFunction,
    private readonly options: {
      mode: 'expose' | 'boundaries' | null;
      boundaryClasses: Type[];
      failFastEnabled: boolean;
      autoExposeEnabled: boolean;
    }
  ) {}

  public resolveOrMock(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): any {
    // 1. Check explicit mocks first (highest priority)
    const existingMock = this.mockedFromBeforeContainer.resolve(identifier, metadata);
    if (existingMock !== undefined) {
      return existingMock;
    }

    // 2. Check if it's a boundary (in boundaries mode)
    if (this.options.mode === 'boundaries' &&
        typeof identifier === 'function' &&
        this.options.boundaryClasses.includes(identifier)) {
      const mock = this.mockFunction();
      this.dependencyMap.set(identifier, mock, metadata);
      return mock;
    }

    // 3. Check if primitive/token (always mock)
    if (this.isLeafOrPrimitive(identifier)) {
      const mock = this.mockFunction();
      this.dependencyMap.set(identifier, mock, metadata);
      return mock;
    }

    // 4. Mode-specific logic
    if (this.options.autoExposeEnabled) {
      // Boundaries mode: auto-expose non-boundaries
      return this.instantiateClass(identifier as Type, metadata);
    }

    // 5. Check if explicitly exposed (expose mode)
    if (typeof identifier === 'function' &&
        this.classesToExpose.includes(identifier)) {
      return this.instantiateClass(identifier, metadata);
    }

    // 6. Fail-fast or auto-mock
    if (this.options.failFastEnabled) {
      const name = typeof identifier === 'function'
        ? identifier.name
        : String(identifier);

      throw new Error(
        `Dependency '${name}' was not configured.\n` +
        `\n` +
        `${this.getModeSpe­cificMessage()}\n` +
        `\n` +
        `To fix this, either:\n` +
        `  - Configure the dependency explicitly\n` +
        `  - Use .disableFailFast() to restore v3.x behavior (not recommended)\n` +
        `\n` +
        `Learn more: https://suites.dev/docs/v4-migration`
      );
    }

    // 7. Backward compatibility: auto-mock
    const mock = this.mockFunction();
    this.dependencyMap.set(identifier, mock, metadata);
    return mock;
  }

  private getModeSpecificMessage(): string {
    if (this.options.mode === 'boundaries') {
      return 'In boundaries mode, all dependencies are real by default.\n' +
             'Add to boundaries array to mock, or use .mock() for custom behavior.';
    }
    return 'In expose mode, all dependencies are mocked by default.\n' +
           'Use .expose() to make real, or .mock() for custom behavior.';
  }
}
```

## Resolution Order

The dependency resolution follows this priority:

1. **Explicit mocks** (`.mock().impl()` or `.mock().final()`)
2. **Boundaries** (if in boundaries mode)
3. **Tokens/Primitives** (always mocked)
4. **Auto-expose** (if in boundaries mode)
5. **Explicit expose** (if in expose mode)
6. **Fail-fast** (throw error)
7. **Auto-mock** (fallback for backward compatibility)

## Mode Behavior Matrix

| Mode | Default | Boundaries | Expose | Tokens | Fail-Fast |
|------|---------|------------|--------|--------|-----------|
| **expose** | Mocked | N/A | Real | Mocked | ON* |
| **boundaries** | Real | Mocked | N/A | Mocked | ON |
| **neither** | Mocked | N/A | N/A | Mocked | ON* |

*Can be disabled with `.disableFailFast()`

## Error Messages

### Mode Conflict Error
```
Cannot use .boundaries() after .expose().
These represent opposite testing strategies:
  - .expose(): Start with all mocked, selectively make real
  - .boundaries(): Start with all real, selectively mock boundaries
Choose one approach for your test.
```

### Fail-Fast Error (Boundaries Mode)
```
Dependency 'EmailService' was not configured.

In boundaries mode, all dependencies are real by default.
Add to boundaries array to mock, or use .mock() for custom behavior.

To fix this, either:
  - Configure the dependency explicitly
  - Use .disableFailFast() to restore v3.x behavior (not recommended)

Learn more: https://suites.dev/docs/v4-migration
```

### Fail-Fast Error (Expose Mode)
```
Dependency 'DatabaseService' was not configured.

In expose mode, all dependencies are mocked by default.
Use .expose() to make real, or .mock() for custom behavior.

To fix this, either:
  - Configure the dependency explicitly
  - Use .disableFailFast() to restore v3.x behavior (not recommended)

Learn more: https://suites.dev/docs/v4-migration
```

## Testing Requirements

### Unit Tests
- Mode mutual exclusivity
- Fail-fast behavior in both modes
- Token auto-mocking
- Backward compatibility with disableFailFast()
- Error message accuracy

### E2E Tests
- Complete boundaries workflow
- Lying test prevention
- Migration scenarios
- Real-world usage patterns

### Performance Tests
- No regression in compilation time
- No regression in test execution time
- Memory usage comparable to v3.x

## Migration Guide

See `MIGRATION_V4.md` for detailed migration instructions.

## Version Plan

- **v4.0.0-alpha.1**: Core implementation
- **v4.0.0-beta.1**: Beta testing with users
- **v4.0.0**: Stable release

## Breaking Changes

1. **Fail-fast by default**: Tests may fail that previously passed
2. **Type signature change**: `TestBed.sociable()` returns full builder

## Deprecations

- `.disableFailFast()`: Will be removed in v5.0.0