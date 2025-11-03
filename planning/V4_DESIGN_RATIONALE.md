# v4.0.0 Design Rationale & Philosophy

## Executive Summary for 500K Users

Suites v4.0.0 introduces **boundaries** - a new way to write sociable tests that solves the "tedious configuration" problem while preventing "lying tests" through fail-fast behavior. This document explains every design decision and trade-off.

## The Problem We're Solving

### Context: GitHub Discussion #655
A production user (QozbroQqn) with a large NestJS application (80+ modules, 500+ files, 1000+ tests) reported two critical issues:

1. **Tedious Configuration**: Having to call `.expose()` dozens of times
2. **Lying Tests**: Tests passing when they should fail due to silent `undefined` returns

### The "Lying Test" Problem Explained

```typescript
// Current v3.x behavior - a test that lies
TestBed.sociable(PaymentService)
  .expose(Logger)
  .compile();

// If DatabaseService.save() is called but not exposed:
// - Returns undefined silently
// - Test continues and passes
// - Production fails because save() doesn't actually work
```

**Impact**: Tests give false confidence. Bugs reach production.

## The Solution: Two Complementary Features

### 1. Boundaries API (Solves Tedious Configuration)

**Mental Model Inversion**:
- **Expose** (v3.x): "Start with everything mocked, selectively make things real"
- **Boundaries** (v4.0): "Start with everything real, selectively mock boundaries"

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
  .boundaries([DatabaseService, HttpClient]) // Just mock I/O
  .compile();
```

### 2. Fail-Fast Behavior (Solves Lying Tests)

**Key Decision**: Fail-fast is ON by default in v4.0 for both modes.

```typescript
// If a dependency is accessed but not configured:
// v3.x: Returns undefined (silent failure) ❌
// v4.0: Throws error with helpful message ✅
```

## Critical Design Decisions

### Decision 1: Mutual Exclusivity of Modes

**Why**: Mental model clarity is paramount.

```typescript
// This is FORBIDDEN - would be confusing
.boundaries([Database])
.expose(Logger)  // ERROR: Can't mix modes
```

**Rationale**:
- Users must choose ONE mental model per test
- Prevents confusion about default behavior
- Makes tests more maintainable

### Decision 2: Fail-Fast by Default (Breaking Change)

**Why**: Safety over convenience.

**Trade-off Analysis**:
- **Cost**: Existing tests might break
- **Benefit**: Prevents production bugs
- **Mitigation**: `.disableFailFast()` for gradual migration

**We chose safety** because:
1. The whole point is preventing lying tests
2. Breaking at test time is better than breaking in production
3. Clear migration path exists

### Decision 3: Tokens Are Always Mocked

**Technical Insight**: Token injections (`@Inject('TOKEN')`) are natural boundaries.

```typescript
// These are ALWAYS mocked, regardless of mode:
@Inject('DATABASE_CONNECTION')
@Inject('API_KEY')
@Inject(CACHE_SYMBOL)
```

**Why**:
- Tokens typically represent I/O or configuration
- They're leaves in the dependency graph
- Consistent behavior across modes

### Decision 4: Single boundaries() Call, Not Chained

**API Design**:
```typescript
// Chosen approach - single array
.boundaries([ServiceA, ServiceB, ServiceC])

// Rejected approach - chaining
.boundaries(ServiceA).boundaries(ServiceB).boundaries(ServiceC)
```

**Rationale**:
- Boundaries are conceptually a set, not a sequence
- Aligns with mental model of "drawing a boundary"
- Cleaner, more declarative

## Philosophical Principles

### 1. Explicit Over Implicit
- No automatic boundary detection
- User must declare intent
- Clear error messages when configuration missing

### 2. Safety Over Convenience
- Fail-fast by default
- Breaking change accepted for correctness
- Escape hatches available but discouraged

### 3. Mental Model Consistency
- One mode per test
- Clear semantics for each mode
- No surprising behavior

### 4. Progressive Disclosure
- Simple cases are simple
- Complex cases are possible
- Advanced features don't complicate basic usage

## Trade-offs We Accepted

### 1. Breaking Change for Fail-Fast

**Cost**:
- Some v3.x tests will fail in v4.0
- Users must add `.disableFailFast()` or fix tests

**Benefit**:
- Catches bugs at test time
- Prevents lying tests
- Improves code quality

**Verdict**: Worth it for 500K users' production safety.

### 2. Mode Mutual Exclusivity

**Cost**:
- Can't mix expose and boundaries
- Some flexibility lost

**Benefit**:
- Clear mental models
- Predictable behavior
- Easier to understand

**Verdict**: Clarity wins over flexibility.

### 3. No Automatic Mode Selection

**Cost**:
- User must choose explicitly
- One more decision to make

**Benefit**:
- Explicit intent
- No surprises
- Self-documenting tests

**Verdict**: Explicit is better than implicit.

## Implementation Complexity

### What We're NOT Doing

1. **Auto-detection of boundaries**: Too magic, unpredictable
2. **Smart defaults**: No guessing what user wants
3. **Multiple fail-fast levels**: Binary on/off is simpler
4. **Gradual boundaries**: All or nothing per test

### Why Simplicity Matters

With 500K monthly downloads:
- Every edge case multiplies across thousands of projects
- Simple mental models reduce support burden
- Clear semantics prevent misuse
- Predictable behavior builds trust

## Migration Strategy

### For Existing Users

```typescript
// Option 1: Add disableFailFast() temporarily
TestBed.sociable(Service)
  .expose(Dep)
  .disableFailFast() // Restore v3.x behavior
  .compile();

// Option 2: Fix the tests properly
TestBed.sociable(Service)
  .expose(Dep)
  .mock(OtherDep).impl(...) // Explicitly configure all deps
  .compile();

// Option 3: Switch to boundaries if appropriate
TestBed.sociable(Service)
  .boundaries([IoService]) // Often simpler!
  .compile();
```

### For New Users

Start with boundaries by default:
- Simpler mental model
- Less configuration
- Safer defaults

## Success Metrics

### Technical Success
- ✅ Solves tedious configuration (boundaries)
- ✅ Prevents lying tests (fail-fast)
- ✅ Maintains backward compatibility path
- ✅ Clear mental models

### User Success
- Reduced test configuration time
- Fewer production bugs
- Clearer test intent
- Better test maintainability

## FAQ for Implementers

### Q: Why not make fail-fast opt-in?
A: The whole point is preventing lying tests. Opt-in means most users won't benefit.

### Q: Why can't modes be mixed?
A: Mental model clarity. "Are deps mocked or real by default?" must have ONE answer.

### Q: Why are tokens always mocked?
A: They represent I/O/config boundaries naturally. Consistency across modes.

### Q: Why boundaries instead of exposeAll?
A: Better mental model. You're defining boundaries, not exposing everything.

### Q: Is this too opinionated?
A: Yes, intentionally. With 500K users, opinionated defaults prevent misuse.

## Conclusion

v4.0.0 makes a deliberate trade-off: **breaking change for safety**.

We believe preventing production bugs is worth the migration cost. The design prioritizes:
1. **Safety** (fail-fast by default)
2. **Simplicity** (clear mental models)
3. **Practicality** (solves real problems)

Every decision was made with 500K monthly users in mind. This isn't just a feature - it's a commitment to helping developers write better, safer tests.