# Suites v4.0.0 Complete Knowledge Base

**Last Updated**: 2025-10-31
**Purpose**: Complete reference for AI agents, developers, and documentation team
**Scope**: Everything about TestBed API and v4.0.0 implementation

---

## Table of Contents

1. [Critical Insights - Read First](#critical-insights)
2. [TestBed API Overview](#testbed-api-overview)
3. [Version 4.0.0 Changes](#version-40-changes)
4. [Technical Implementation](#technical-implementation)
5. [Migration Guide](#migration-guide)
6. [Design Rationale](#design-rationale)

---

## Critical Insights

### 🔥 Insight #1: Boundaries Is NOT For I/O Isolation

**The Misconception**:
"Boundaries is for mocking I/O like databases and HTTP clients"

**The Reality**:
**I/O is ALREADY mocked via token injection!**

```typescript
@Injectable()
class DatabaseService {
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {}
  //           ^^^^^^^^ TOKEN - ALWAYS auto-mocked at Priority 3!
}
```

**Code Proof** from `dependency-resolver.ts`:

**Line 93-103: Priority 3 (Before boundaries check)**
```typescript
if (this.isLeafOrPrimitive(identifier)) {  // typeof !== 'function'
  const mock = this.mockFunction();
  return mock;  // ← Tokens mocked HERE
}
```

**Line 82-91: Priority 2 (Boundaries check)**
```typescript
if (this.options.mode === 'boundaries' &&
    typeof identifier === 'function') {  // ← Only classes
  const mock = this.mockFunction();
  return mock;
}
```

**Tokens are checked FIRST, never reach boundaries check!**

**What Boundaries Is Actually For**:

Mock **expensive/external CLASS dependencies**:
- ML/AI services (RecommendationEngine)
- Heavy computation (5-second algorithms)
- Third-party SDK classes
- Flaky/non-deterministic services

**Example**:
```typescript
TestBed.sociable(UserService)
  .boundaries([RecommendationEngine]) // Expensive class, not I/O!
  .compile();

// Result:
// - RecommendationEngine → Mocked (expensive, don't want to run)
// - BusinessLogic services → Real (want to test)
// - @Inject('PRISMA') → Auto-mocked (token, natural boundary)
```

### 🔥 Insight #2: Fail-Fast Is Critical in EXPOSE Mode

**Why Fail-Fast Matters Most in Expose Mode**:

In **expose mode**:
- Default: Everything mocked
- Non-exposed deps return `undefined`
- **"Lying tests"** - tests pass with undefined, production fails

In **boundaries mode**:
- Default: Everything real
- Real instantiation fails naturally if deps missing
- Less need for fail-fast (but still valuable for consistency)

**The "Lying Test" Example**:

```typescript
// WITHOUT fail-fast (v3.x)
TestBed.sociable(PaymentService)
  .expose(Logger)
  .compile();

// DatabaseService not exposed → auto-mocked → returns undefined
await paymentService.charge(100); // undefined.save() = silent failure
// Test passes but payment was never saved! ❌
```

```typescript
// WITH fail-fast (v4.0)
TestBed.sociable(PaymentService)
  .expose(Logger)
  .compile();

// DatabaseService not configured → THROWS immediately ✅
// Bug caught at test time, not production!
```

### 🔥 Insight #3: Modes Are Opposite Mental Models

**Expose Mode (Whitelist)**:
- **Default**: Everything MOCKED
- **`.expose()`**: Make these REAL
- **Mental model**: "Start in a sealed box, open specific windows"

**Boundaries Mode (Blacklist)**:
- **Default**: Everything REAL
- **`.boundaries()`**: Make these MOCKED
- **Mental model**: "Start in an open field, set up walls at edges"

**Why They Can't Mix**:

```typescript
.boundaries([A]).expose(B)  // ERROR!
// Question: Is C mocked or real by default?
// In boundaries mode: Real
// In expose mode: Mocked
// IMPOSSIBLE TO ANSWER - mental models conflict!
```

### 🔥 Insight #4: Resolution Priority Order

The dependency resolver follows this order (from `dependency-resolver.ts:69-146`):

1. **Explicit mocks** - `.mock().impl()` ALWAYS wins
2. **Boundaries** - Class in boundaries array (if boundaries mode)
3. **Tokens** - ALWAYS mocked (natural boundaries)
4. **Auto-expose** - Classes auto-exposed (if boundaries mode)
5. **Explicit expose** - In expose list (if expose mode)
6. **Fail-fast** - Throw error (if enabled)
7. **Auto-mock** - Fallback (backward compat)

**Why this order**:
- Explicit intent (1-2) beats defaults (3-5)
- Tokens (3) checked before mode logic (4-5)
- Fail-fast (6) catches unhandled cases
- Auto-mock (7) for backward compatibility

---

## TestBed API Overview

### Core Purpose

TestBed is Suites' primary API for creating unit tests. It supports two testing philosophies:
- **Solitary tests**: Test a class in isolation with all dependencies mocked
- **Sociable tests**: Test a class with some real dependencies (collaborators)

### Key Mental Model

Suites considers sociable tests as **UNIT tests, not integration tests** because I/O is never actually reached - it's injected via tokens which are automatically mocked.

### Token Injections: Natural Boundaries

**Tokens are natural boundaries** - this is foundational to understanding TestBed:

```typescript
// These are ALWAYS auto-mocked, regardless of configuration:
@Inject('PRISMA')           // String token
@Inject('DATABASE')         // String token
@Inject(CACHE_SYMBOL)       // Symbol token
```

From `dependency-resolver.ts:24-28`:
```typescript
public isLeafOrPrimitive(identifier: InjectableIdentifier): boolean {
  return typeof identifier !== 'function' ||  // ← Tokens stop here
         this.adapter.inspect(identifier as Type).list().length === 0;
}
```

Because tokens aren't class constructors, Suites **cannot traverse beyond them** - they create "walls" in the dependency graph that are automatically mocked.

### Real-World Example

From `e2e/jest/nestjs/e2e-assets.ts:68-81`:

```typescript
@Injectable()
export class NestJSTestClass {
  public constructor(
    @Inject('LOGGER') private readonly logger: Logger,              // ← WALL (string token)
    @Inject('UNDEFINED') private readonly undefinedParam: undefined, // ← WALL (string token)
    @Inject(Foo) private readonly fooRepository: Repository<Foo>,    // ← WALL (class used as token)
    private readonly testClassTwo: TestClassTwo,                     // ✅ Can traverse (direct class)
    @Inject('CONSTANT_VALUE') private readonly primitiveValue: string, // ← WALL (string token)
    private readonly testClassOne: TestClassOne,                     // ✅ Can traverse (direct class)
    @Inject(SymbolToken) private readonly symbolToken: TestClassFive, // ← WALL (symbol token)
  ) {}
}
```

**What Suites can do**:
- ✅ `testClassTwo: TestClassTwo` → Can instantiate and traverse
- ✅ `testClassOne: TestClassOne` → Can instantiate and traverse

**What creates walls** (must be mocked):
- ❌ `@Inject('LOGGER')` → String token, can't traverse
- ❌ `@Inject(Foo)` → Class used as token, can't traverse
- ❌ `@Inject(SymbolToken)` → Symbol token, can't traverse

---

## Version 4.0.0 Changes

### The Core Problem Being Solved

From **GitHub Discussion #655** by production user QozbroQqn (large NestJS app: 80+ modules, 500+ files, 1000+ tests):

1. **"Lying Tests"**: Tests pass incorrectly because non-exposed dependencies return `undefined` silently
2. **Tedious Configuration**: Having to call `.expose()` dozens of times for complex dependency trees

### Two Complementary Features

#### 1. Boundaries API (Solves Tedious Configuration)

**Mental Model Inversion**:
- **v3.x Expose** (Whitelist): "Start with everything mocked, selectively make things real"
- **v4.0 Boundaries** (Blacklist): "Start with everything real, selectively mock boundaries"

```typescript
// Old way (tedious)
TestBed.sociable(UserService)
  .expose(ServiceA)
  .expose(ServiceB)
  .expose(ServiceC)
  // ... 20 more lines
  .compile();

// New way (simple)
TestBed.sociable(UserService)
  .boundaries([ExpensiveService, FlakeyService]) // Mock expensive/flaky classes
  .compile();
```

**Important**: Boundaries are for expensive/external CLASS dependencies, NOT I/O (I/O is already mocked via tokens).

#### 2. Fail-Fast Behavior (Solves Lying Tests)

**Breaking change**: Fail-fast is **ON by default** in v4.0 for both modes.

```typescript
// v3.x: Returns undefined (silent failure) ❌
// v4.0: Throws error with helpful message ✅
```

### API Changes

#### Type Signature Change

**v3.x**:
```typescript
TestBed.sociable(Service): Pick<Builder, 'expose'> // Forces .expose() first
```

**v4.0**:
```typescript
TestBed.sociable(Service): SociableTestBedBuilder<TClass> // Full builder immediately
```

#### New Methods

**`.boundaries(dependencies: Type[])`**
- Declares dependencies to mock
- Auto-exposes everything else
- Enables fail-fast automatically
- Throws if `.expose()` was called before

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
 */
TestBed.sociable(UserService)
  .boundaries([RecommendationEngine, CacheService])
  .compile();
```

**`.disableFailFast()`**
- Disables fail-fast behavior (migration helper)
- Logs deprecation warning
- Restores v3.x undefined behavior
- **Will be removed in v5.0.0**

```typescript
TestBed.sociable(Service)
  .expose(Dep)
  .disableFailFast() // Temporary escape hatch
  .compile();
```

### Mode Behavior Matrix

| Mode | Default | Boundaries | Expose | Tokens | Fail-Fast |
|------|---------|------------|--------|--------|-----------|
| **expose** | Mocked | N/A | Real | Mocked | ON* |
| **boundaries** | Real | Mocked | N/A | Mocked | ON |
| **neither** | Mocked | N/A | N/A | Mocked | ON* |

*Can be disabled with `.disableFailFast()`

### Key Design Decisions

#### Decision 1: Mutual Exclusivity of Modes

```typescript
// This is FORBIDDEN - would be confusing
.boundaries([Database])
.expose(Logger)  // ERROR: Can't mix modes
```

**Rationale**: Users must choose ONE mental model per test for clarity.

**Code enforcement** (`sociable-unit-builder.ts:61-73, 101-115`):
- Calling `.expose()` after `.boundaries()` → throws
- Calling `.boundaries()` after `.expose()` → throws
- Mode is set once, cannot change

#### Decision 2: Fail-Fast by Default

**Trade-off**: Breaking change for safety
- **Cost**: Existing tests might break
- **Benefit**: Prevents production bugs
- **Mitigation**: `.disableFailFast()` escape hatch

#### Decision 3: Tokens Always Mocked

Regardless of mode, token injections are always mocked because they represent natural boundaries (I/O, config, etc.).

---

## Technical Implementation

### File Changes

**Core Changes**:

| File | Changes | Breaking |
|------|---------|----------|
| `packages/unit/src/testbed.ts` | Remove `Pick<..., 'expose'>` constraint | NO |
| `packages/core/src/services/builders/sociable-unit-builder.ts` | Add `.boundaries()` method | NO |
| `packages/core/src/services/builders/sociable-unit-builder.ts` | Add `validateConfiguration()` | NO |
| `packages/core/src/services/builders/sociable-unit-builder.ts` | Add `.disableFailFast()` | NO |
| `packages/core/src/services/dependency-resolver.ts` | Implement fail-fast in `resolveOrMock()` | YES |
| `packages/core/src/services/dependency-resolver.ts` | Add boundaries check | NO |

### Resolution Logic

From `dependency-resolver.ts`, the resolution follows this priority:

```typescript
public resolveOrMock(identifier: InjectableIdentifier, metadata?: IdentifierMetadata): any {
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
    throw new Error(`Dependency '${name}' was not configured...`);
  }

  // 7. Backward compatibility: auto-mock
  const mock = this.mockFunction();
  this.dependencyMap.set(identifier, mock, metadata);
  return mock;
}
```

### Error Messages

**Fail-Fast in Boundaries Mode**:
```
Dependency 'EmailService' was not configured.

In boundaries mode, all dependencies are real by default.
Add to boundaries array to mock, or use .mock() for custom behavior.

To fix this, either:
  - Configure the dependency explicitly
  - Use .disableFailFast() to restore v3.x behavior (not recommended)

Learn more: https://suites.dev/docs/v4-migration
```

**Mode Conflict**:
```
Cannot use .expose() after .boundaries().

These represent opposite testing strategies:
  - .expose(): Start with all mocked, selectively make real (whitelist)
  - .boundaries(): Start with all real, selectively mock (blacklist)

Choose one approach for your test.
```

**Configuration Conflict (expose + mock)**:
```
Configuration conflict for 'CacheService':
Cannot both expose() and mock() the same dependency.
  - expose() = use real instance (traverse dependencies)
  - mock() = use fake instance (don't traverse)
Remove either the expose() or mock() call for 'CacheService'.
```

### Validation System

From `sociable-unit-builder.ts`, validation runs at compile time:

```typescript
private validateConfiguration(): void {
  const exposedSet = new Set(this.classesToExpose);
  const boundarySet = new Set(this.boundaryClasses);
  const mockedIdentifiers = [...this.identifiersToBeMocked.map(([id]) => id)];

  // ERROR: expose + mock conflict
  mockedIdentifiers.forEach(id => {
    if (typeof id === 'function' && exposedSet.has(id)) {
      throw new Error(`Configuration conflict for '${id.name}'...`);
    }
  });

  // ERROR: expose + boundaries conflict
  exposedSet.forEach(cls => {
    if (boundarySet.has(cls)) {
      throw new Error(`Configuration conflict for '${cls.name}'...`);
    }
  });

  // WARNING: boundaries + mock redundancy
  mockedIdentifiers.forEach(id => {
    if (typeof id === 'function' && boundarySet.has(id)) {
      console.warn(`⚠️ Redundant configuration for '${id.name}'...`);
    }
  });
}
```

---

## Migration Guide

### Breaking Changes

#### 1. Fail-Fast is ON by Default

**Impact**: Tests that relied on silent `undefined` returns will now throw errors.

**Before** (v3.x):
```typescript
// Non-configured dependencies returned undefined
const { unit } = await TestBed.sociable(UserService)
  .expose(AuthService)
  .compile();

// DatabaseService not configured - returns undefined
await unit.saveUser(user); // Silently fails, test passes
```

**After** (v4.0):
```typescript
// Same test now throws error
const { unit } = await TestBed.sociable(UserService)
  .expose(AuthService)
  .compile();

// ❌ Error: Dependency 'DatabaseService' was not configured
await unit.saveUser(user);
```

#### 2. Type Signature Change

The `TestBed.sociable()` method now returns the full builder immediately (non-breaking, but expands API).

### Migration Strategies

**Strategy 1: Quick Fix (Not Recommended)**

Add `.disableFailFast()` to restore v3.x behavior temporarily:

```typescript
const { unit } = await TestBed.sociable(UserService)
  .expose(AuthService)
  .disableFailFast() // ⚠️ Temporary fix
  .compile();
```

**Warning**: This defeats the purpose of v4.0. Use only as a temporary measure.

**Strategy 2: Fix Your Tests (Recommended)**

Configure all dependencies explicitly:

```typescript
const { unit } = await TestBed.sociable(UserService)
  .expose(AuthService)
  .expose(UserDal)
  .mock(DatabaseService).impl(() => ({
    save: jest.fn()
  }))
  .mock(EmailService).impl(() => ({
    send: jest.fn()
  }))
  .compile();
```

**Strategy 3: Switch to Boundaries (Best for Most Cases)**

If you're exposing many dependencies, boundaries is simpler:

```typescript
// Before: Tedious expose list
const { unit } = await TestBed.sociable(UserService)
  .expose(AuthService)
  .expose(UserDal)
  .expose(ValidationService)
  .expose(CacheService)
  .expose(ConfigService)
  // ... many more
  .compile();

// After: Simple boundaries
const { unit } = await TestBed.sociable(UserService)
  .boundaries([ExpensiveMLService]) // Just mock expensive classes
  .compile();
```

### Common Scenarios

#### Scenario 1: Tests That Were Already Broken

Some v3.x tests were passing incorrectly. v4.0 will expose these:

**v3.x "Lying Test"**:
```typescript
it('should save user', async () => {
  const { unit } = await TestBed.sociable(UserService)
    .expose(ValidationService)
    .compile();

  // This test passes but doesn't actually save!
  // DatabaseService.save() returns undefined
  await unit.createUser({ name: 'John' });

  // ❌ Test passes but user was never saved!
});
```

**v4.0 forces you to fix it**:
```typescript
it('should save user', async () => {
  const { unit, unitRef } = await TestBed.sociable(UserService)
    .expose(ValidationService)
    .mock(DatabaseService).impl((stub) => ({
      save: stub().mockResolvedValue(true)
    }))
    .compile();

  await unit.createUser({ name: 'John' });

  // ✅ Now we're actually testing the save behavior
  const mockDb = unitRef.get(DatabaseService);
  expect(mockDb.save).toHaveBeenCalled();
});
```

#### Scenario 2: Complex Integration Test

**v3.x Test with many exposes**:
```typescript
const { unit } = await TestBed.sociable(CheckoutService)
  .expose(OrderService)
  .expose(InventoryService)
  .expose(PricingService)
  .expose(TaxService)
  .expose(ValidationService)
  .expose(UserService)
  .expose(ProductService)
  .expose(CouponService)
  .mock(PaymentGateway).impl(mockPayment)
  .mock(EmailSender).impl(mockEmail)
  .compile();
```

**v4.0 with boundaries (much simpler)**:
```typescript
const { unit } = await TestBed.sociable(CheckoutService)
  .boundaries([PaymentGateway, EmailSender]) // Only mock external services
  .compile();
```

### Troubleshooting

**Error: "Cannot use .boundaries() after .expose()"**

You're mixing modes. Choose one:
- Use `.expose()` for fine-grained control
- Use `.boundaries()` for simpler configuration

**Error: "Dependency 'X' was not configured"**

Options:
1. Add to `.expose()` to make it real
2. Add to `.boundaries()` to mock it
3. Use `.mock()` for custom behavior
4. Use `.disableFailFast()` temporarily (not recommended)

---

## Design Rationale

### Philosophical Principles

#### 1. Explicit Over Implicit
- No automatic boundary detection
- User must declare intent
- Clear error messages when configuration missing

#### 2. Safety Over Convenience
- Fail-fast by default
- Breaking change accepted for correctness
- Escape hatches available but discouraged

#### 3. Mental Model Consistency
- One mode per test
- Clear semantics for each mode
- No surprising behavior

#### 4. Progressive Disclosure
- Simple cases are simple
- Complex cases are possible
- Advanced features don't complicate basic usage

### Trade-offs We Accepted

#### 1. Breaking Change for Fail-Fast

**Cost**:
- Some v3.x tests will fail in v4.0
- Users must add `.disableFailFast()` or fix tests

**Benefit**:
- Catches bugs at test time
- Prevents lying tests
- Improves code quality

**Verdict**: Worth it for 500K users' production safety.

#### 2. Mode Mutual Exclusivity

**Cost**:
- Can't mix expose and boundaries
- Some flexibility lost

**Benefit**:
- Clear mental models
- Predictable behavior
- Easier to understand

**Verdict**: Clarity wins over flexibility.

#### 3. No Automatic Mode Selection

**Cost**:
- User must choose explicitly
- One more decision to make

**Benefit**:
- Explicit intent
- No surprises
- Self-documenting tests

**Verdict**: Explicit is better than implicit.

### Success Metrics

With 500K monthly downloads, success means:
- Fewer production bugs (fail-fast catches issues)
- Faster test writing (boundaries simplifies config)
- Clear mental models (mutual exclusivity prevents confusion)
- Smooth migration (escape hatches available)

### Implementation Complexity

- **~275 lines of code** including tests
- **3-week timeline** for implementation
- **Zero breaking changes** for existing v3.x API (except fail-fast behavior)
- **Non-breaking type changes** (expansion, not restriction)

---

## Best Practices

### Use Boundaries for Expensive Classes

```typescript
.boundaries([
  RecommendationEngine,  // Heavy ML computation
  CacheService,         // Expensive to instantiate
  NotificationService,  // Flaky/external service
])
```

### Use Expose for Specific Collaboration

```typescript
.expose(PartnerService) // Test specific interaction
.mock(EverythingElse).impl(...) // Mock the rest
```

### Always Configure All Dependencies

Never rely on undefined behavior:
```typescript
// Bad: Unclear what happens with unconfigured deps
.expose(ServiceA)

// Good: Explicit about all deps
.expose(ServiceA)
.mock(ServiceB).impl(...)
.mock(ServiceC).impl(...)
```

### Remember: Tokens Are Auto-Mocked

Don't declare token-injected I/O as boundaries:

```typescript
// ❌ Unnecessary - tokens are auto-mocked
.boundaries([PrismaService]) // If @Inject('PRISMA') is used

// ✅ Correct - only expensive class deps
.boundaries([ExpensiveMLService])
```

---

## Summary

### What v4.0.0 Changes

**Added**:
- ✅ `.boundaries()` method
- ✅ Fail-fast by default
- ✅ Configuration validation
- ✅ `.disableFailFast()` escape hatch

**Changed**:
- ✅ Type signature (non-breaking expansion)
- ✅ Error behavior (breaking - now throws instead of undefined)

**Stayed the same**:
- ✅ All existing `.expose()` API
- ✅ Token auto-mocking behavior
- ✅ `.mock()` API

### For Documentation Writers

When explaining boundaries, emphasize:
- ❌ NOT "mock your database and HTTP"
- ✅ YES "mock expensive computations and external class services"
- ✅ YES "tokens (I/O) are already mocked automatically"
- ✅ YES "boundaries is for test performance and scope control"

### Timeline

- **v4.0.0-alpha.1**: Core implementation
- **v4.0.0-beta.1**: Beta testing with users
- **v4.0.0**: Stable release
- **v5.0.0**: Remove `.disableFailFast()`