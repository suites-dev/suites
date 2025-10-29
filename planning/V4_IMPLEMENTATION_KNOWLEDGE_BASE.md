# v4.0.0 Implementation Knowledge Base

## Critical Context from Planning Documents

### The Core Problem (from QozbroQqn - GitHub Discussion #655)
- **"Lying Tests"**: Tests pass incorrectly because non-exposed dependencies return `undefined` silently
- **Production User**: Large NestJS app (80+ modules, 500+ files, 1000+ tests)
- **Their Pain**: "Tedious to expose all dependencies" - they need to expose dozens of deps
- **Their Preference**: "We would use 'all'. I love the fail-fast idea with no silent undefined."

### Critical Technical Insight
**Token injections are automatically boundaries** (from `dependency-resolver.ts:24-28`):
```typescript
public isLeafOrPrimitive(identifier: InjectableIdentifier): boolean {
  return (
    typeof identifier !== 'function' ||  // ← Tokens stop here
    this.adapter.inspect(identifier as Type).list().length === 0
  );
}
```
- `@Inject('PRISMA')` → Auto-mocked ✅
- `@Inject('LOGGER')` → Auto-mocked ✅
- This is why sociable tests are UNIT tests, not integration tests - I/O never reached

## Current Architecture Analysis

### 1. Type Constraint Enforcement
**Current**: `testbed.ts` line 71 returns `Pick<SociableTestBedBuilder<TClass>, 'expose'>`
- Forces users to call `.expose()` first
- Implements the requirement: "when using TestBed.sociable(), there must be at least one invocation of the .expose() method"
- This constraint needs to be removed to allow `.boundaries()` as first call

### 2. Dependency Resolution Flow
```
TestBed.sociable()
  → SociableTestBedBuilder (manages classesToExpose)
  → UnitMocker.constructUnit()
  → DependencyResolver.resolveOrMock()
  → Returns mock or real instance
```

### 3. Current Resolution Logic (`dependency-resolver.ts`)
1. Check explicit mocks from container (`.mock().impl()` or `.mock().final()`)
2. Check if leaf/primitive (tokens) → auto-mock
3. Check if in classesToExpose → instantiate real
4. Otherwise → auto-mock

### 4. Key Implementation Files
- `packages/unit/src/testbed.ts` - Entry point, type constraints
- `packages/core/src/services/builders/sociable-unit-builder.ts` - Builder pattern
- `packages/core/src/services/dependency-resolver.ts` - Resolution logic
- `packages/core/src/services/unit-mocker.ts` - Orchestrates mocking
- `packages/core/src/types.ts` - Interface definitions

### 5. Existing Validation System
The builder already has a warning system (lines 53-75 in `sociable-unit-builder.ts`):
- Warns about unreachable mocks
- Warns about unreachable exposed dependencies
- We can extend this for conflict detection

## Mental Models - Critical Understanding

### Two Opposite Approaches (Mutually Exclusive)

#### Expose Mode (Current v3.x - Whitelist)
- **Default**: Everything MOCKED
- **`.expose()`**: Makes specific deps REAL
- **Mental model**: "I'm in a sealed box, opening specific windows"
- **Use case**: Fine-grained control, testing specific collaborations

#### Boundaries Mode (New v4.0 - Blacklist)
- **Default**: Everything REAL (auto-exposed)
- **`.boundaries()`**: Makes specific deps MOCKED
- **Mental model**: "I'm in an open field, setting up walls at the edges"
- **Use case**: Most dependencies real, only mock I/O boundaries

**CRITICAL**: These modes cannot be mixed! They represent opposite philosophies.

## Design Decisions & Rationale

### 1. Why Mutual Exclusivity?
- Mixing modes creates confusion: "Is this dep real or mocked by default?"
- Clear mental model prevents bugs
- Enforces intentional test design

### 2. Why Fail-Fast is Essential
Even with auto-expose, you need fail-fast because:
- **Configuration mistakes**: Typos in class names
- **Refactoring safety**: New deps added without updating tests
- **Explicit intent**: Forces developers to declare their testing strategy

Without fail-fast, boundaries mode would still have "lying tests" when someone forgets to declare a boundary.

### 3. `.mock()` Always Wins
- Explicit user intent takes precedence
- Works the same in both modes
- In expose mode: Overrides default mock
- In boundaries mode: Overrides auto-expose

### 4. Why Not `.exposeAll()`?
From FINAL_V4_DESIGN.md:
- `.boundaries()` already implies auto-expose
- Simpler API surface
- One method instead of two

## Implementation Priorities

### Phase 1: Core Features (Must Have)
1. Remove type constraint
2. Add `.boundaries()` method
3. Implement mode detection
4. Add mutual exclusivity checks
5. Implement auto-expose logic
6. Add fail-fast mechanism

### Phase 2: Developer Experience
1. Clear error messages with examples
2. Conflict detection and warnings
3. Migration helper (`.disableFailFast()`)

### Phase 3: Testing
1. E2E tests for boundaries mode
2. E2E tests for fail-fast
3. E2E tests for mode conflicts
4. Migration scenario tests

## Edge Cases to Handle

### 1. Mode Conflicts
```typescript
.boundaries([PrismaService])
.expose(AuthService)  // ERROR: Can't mix modes
```

### 2. Redundancy (Warning, not Error)
```typescript
.boundaries([Logger])
.mock(Logger).impl(...)  // Logger specified twice, mock wins
```

### 3. Expose + Mock Conflict (Error)
```typescript
.expose(Logger)
.mock(Logger).impl(...)  // ERROR: Conflicting intent
```

### 4. No Configuration (Fail-Fast)
```typescript
TestBed.sociable(UserService).compile()  // ERROR: Must configure deps
```

### 5. Token Injections (Always Mocked)
```typescript
// These are ALWAYS mocked, regardless of mode:
@Inject('PRISMA')
@Inject(LOGGER_SYMBOL)
```

## API Signatures

### Current (v3.x)
```typescript
// Forces .expose() first
TestBed.sociable(Service): Pick<Builder, 'expose'>
  .expose(Dep): Builder
  .mock(Dep): MockOverride
  .compile(): Promise<UnitTestBed>
```

### New (v4.0)
```typescript
// Full builder from start
TestBed.sociable(Service): Builder
  .expose(Dep): Builder          // OR
  .boundaries([Deps]): Builder    // (mutually exclusive)
  .mock(Dep): MockOverride
  .disableFailFast(): Builder     // Migration helper
  .compile(): Promise<UnitTestBed>
```

## Error Messages Strategy

### Fail-Fast in Expose Mode
```
Dependency 'EmailService' was not configured.

In expose mode (your current mode), all dependencies are mocked by default.
You must explicitly declare which should be real:
  - .expose(EmailService) - use real implementation
  - .mock(EmailService).impl(...) - custom mock behavior

Currently configured:
  Exposed: AuthService
  Mocked: Logger
```

### Fail-Fast in Boundaries Mode
```
Dependency 'UnknownService' was not configured.

In boundaries mode (your current mode), all dependencies are real by default.
You must explicitly declare boundaries to mock:
  - .boundaries([UnknownService]) - mock at boundary
  - .mock(UnknownService).impl(...) - custom mock behavior

Currently configured:
  Boundaries: PrismaService, HttpClient
  Mocked: Logger
```

### Mode Conflict
```
Cannot use .expose() after .boundaries().

These represent opposite testing strategies:
  - .expose(): Start with all mocked, selectively make real (whitelist)
  - .boundaries(): Start with all real, selectively mock (blacklist)

Choose one approach for your test.
```

## Testing Strategy

### Test Categories
1. **Backward Compatibility**: All v3.x tests must pass unchanged
2. **Boundaries Mode**: New feature tests
3. **Fail-Fast**: Error handling tests
4. **Mode Conflicts**: Validation tests
5. **Migration**: Tests with `.disableFailFast()`

### Critical Test Scenarios
```typescript
// 1. Boundaries basic
.boundaries([PrismaService])
// Everything else real, Prisma mocked

// 2. Mock override in boundaries
.boundaries([PrismaService])
.mock(Logger).impl(...)
// Logger custom mock overrides auto-expose

// 3. Token always mocked
.boundaries([])
// @Inject('TOKEN') still mocked (isLeafOrPrimitive)

// 4. Mode conflict detection
.boundaries([A]).expose(B)  // ERROR

// 5. No configuration fail-fast
.compile()  // ERROR: Must configure
```

## Performance Considerations

1. **Mode check**: Single string comparison, negligible
2. **Boundary lookup**: Use Set for O(1) lookups
3. **Fail-fast check**: Only on miss, not hot path
4. **Auto-expose**: Same instantiation as current expose

## Migration Path

### For Current Users
- No changes required
- Existing `.expose()` tests work identically
- Can adopt `.boundaries()` when ready

### For QozbroQqn's Team
```typescript
// Old (tedious):
.expose(A).expose(B).expose(C)
.expose(D).expose(E).expose(F)
.expose(G).expose(H).expose(I)

// New (simple):
.boundaries([PrismaService, HttpClient])
```

### Temporary Migration Helper
```typescript
.disableFailFast()  // Restore v3.x behavior temporarily
// Logs deprecation warning
// Will be removed in v5.0
```

## Implementation Checklist

- [ ] Remove type constraint in `testbed.ts`
- [ ] Add `boundaries()` method to builder
- [ ] Add mode tracking (`'expose' | 'boundaries' | null`)
- [ ] Add mutual exclusivity validation
- [ ] Update `DependencyResolver` with auto-expose logic
- [ ] Implement fail-fast with clear errors
- [ ] Add `.disableFailFast()` escape hatch
- [ ] Create e2e tests for boundaries mode
- [ ] Create e2e tests for fail-fast
- [ ] Create e2e tests for mode conflicts
- [ ] Update JSDoc documentation
- [ ] Test backward compatibility

## Success Criteria

### Technical
- ✅ Zero breaking changes for existing users
- ✅ Solves "tedious exposure" problem
- ✅ Prevents "lying tests" with fail-fast
- ✅ Clear mental models (no mode mixing)
- ✅ Performance unchanged

### User Experience
- ✅ QozbroQqn can adopt immediately
- ✅ Clear error messages
- ✅ Intuitive API
- ✅ Smooth migration path

## Timeline
- **Week 1**: Core implementation
- **Week 2**: Testing and refinement
- **Week 3**: Beta testing with users
- **Total**: 3 weeks (vs original 4-6 week estimate)

## Notes for Implementation

1. **Start with type change** - Enables everything else
2. **Mode detection is critical** - Determines all behavior
3. **Error messages are UX** - Spend time making them helpful
4. **Test the edges** - Conflicts, tokens, migrations
5. **Document the why** - Mental models matter more than API

## Key Insight Summary

The breakthrough is recognizing these are **two opposite mental models** that should never mix:
- **Expose mode**: Whitelist pattern (closed by default)
- **Boundaries mode**: Blacklist pattern (open by default)

By enforcing mutual exclusivity and adding fail-fast, we:
1. Solve the configuration problem (boundaries = simple)
2. Solve the lying tests problem (fail-fast = safety)
3. Maintain clear mental models (no confusion)
4. Keep backward compatibility (no breaking changes)