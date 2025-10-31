# v4.0.0 Final Design: Simplified Approach

## The Core Problem

**"Lying Tests"** - Production user (QozbroQqn) from large NestJS app reported tests passing incorrectly because non-exposed dependencies return `undefined` silently.

**Source**: [GitHub Discussion #655](https://github.com/suites-dev/suites/discussions/655)

---

## User's Need (In Their Words)

> "Sociable tests expose all dependencies including dependencies of dependencies (except PrismaService or similar external APIs)"

> "We would use 'all'. I love the fail-fast idea with no silent undefined."

**What they want**:
- Expose everything automatically
- EXCEPT specific boundaries (PrismaService, HttpClient, etc.)
- No silent undefined behavior

---

## Critical Insight: Token Injections Are Natural Boundaries

**From code analysis** (`dependency-resolver.ts:24-28`):

```typescript
public isLeafOrPrimitive(identifier: InjectableIdentifier): boolean {
  return (
    typeof identifier !== 'function' ||  // ← Tokens stop here
    this.adapter.inspect(identifier as Type).list().length === 0
  );
}
```

**Token injections are AUTOMATICALLY mocked** (no declaration needed):
- `@Inject('PRISMA')` → Auto-mocked ✅
- `@Inject('LOGGER')` → Auto-mocked ✅
- `@Inject(SYMBOL)` → Auto-mocked ✅

**This is why sociable tests are UNIT tests, not integration tests** - I/O never reached.

---

## The Simplified API Design

### Single Mode: Auto-Expose Everything (Except Boundaries)

**No `.expose()`, no `.exposeAll()`, no mode switching**

```typescript
// Auto-expose everything except boundaries
TestBed.sociable(UserService)
  .boundaries([PrismaService, HttpClient])
  .compile();

// Result:
// - AuthService → Real (auto-exposed) ✅
// - EmailService → Real (auto-exposed) ✅
// - TokenService → Real (auto-exposed) ✅
// - @Inject('PRISMA') → Auto-mocked (token) ✅
// - PrismaService (if class-injected) → Mocked (boundary) ✅
// - HttpClient → Mocked (boundary) ✅
```

**Semantics**: "Make everything real except these boundaries (and tokens which are automatic)"

---

## Why This Is Simple

### Two Opposite Approaches Were Confusing

**Partial mode** (whitelist real):
- Default: Everything mocked
- `.expose()` → Make these real

**All mode** (blacklist mocked):
- Default: Everything real
- `.boundaries()` → Mock these

**Using BOTH together made no sense!** They're opposite philosophies.

---

## The Design Decision

**Go with All mode ONLY** (what QozbroQqn's team uses):

```typescript
// This is all you need:
.boundaries([PrismaService])
```

**If you want custom mock behavior**:
```typescript
.boundaries([PrismaService])
.mock(HttpClient).impl((stub) => ({
  get: stub().mockResolvedValue({ data: 'test' })
}))
```

---

## What About Users Who Want Explicit Control?

**They can use `.mock()` for everything**:

```typescript
// Mock everything explicitly
TestBed.sociable(UserService)
  .mock(AuthService).impl(mockAuth)
  .mock(EmailService).impl(mockEmail)
  .mock(PrismaService).impl(mockPrisma)
  .compile();
```

**This already works in v3.x!** No changes needed.

---

## Implementation Plan

### 1. Keep Current Behavior (v3.x)

**Don't change anything about current `.expose()` API**

```typescript
// This still works exactly as before
TestBed.sociable(UserService)
  .expose(AuthService)
  .compile();

// AuthService → Real
// Everything else → Auto-mocked (current v3.x behavior)
```

**No breaking changes!** ✅

---

### 2. Add `.boundaries()` Method

**New method that enables auto-expose mode**:

```typescript
public boundaries(classes: Type[]): this {
  this.boundaryClasses = [...this.boundaryClasses, ...classes];
  this.autoExposeEnabled = true; // ← Enable auto-expose
  return this;
}
```

**Implementation in `dependency-resolver.ts`**:

```typescript
public resolveOrMock(identifier: InjectableIdentifier): any {
  // Step 1: Check for explicit mock
  const existingMock = this.mockedFromBeforeContainer.resolve(identifier);
  if (existingMock !== undefined) {
    return existingMock;
  }

  // Step 2: Check if it's a boundary
  if (this.options.boundaries?.includes(identifier)) {
    const mock = this.mockFunction();
    return mock;
  }

  // Step 3: Check if leaf/primitive (includes tokens)
  if (this.isLeafOrPrimitive(identifier)) {
    const mock = this.mockFunction();
    return mock;
  }

  // Step 4: NEW - Auto-expose if enabled
  if (this.options.autoExposeEnabled) {
    return this.instantiateClass(identifier);
  }

  // Step 5: Check if exposed (existing v3.x behavior)
  if (this.classesToExpose.includes(identifier)) {
    return this.instantiateClass(identifier);
  }

  // Step 6: Fallback - auto-mock (existing v3.x behavior)
  const mock = this.mockFunction();
  return mock;
}
```

**That's it!** Simple additive change.

---

### 3. Type Signature Changes

**Current constraint** (forces `.expose()` first):
```typescript
): Pick<SociableTestBedBuilder<TClass>, 'expose'> {
```

**New** (allow `.boundaries()` immediately):
```typescript
): SociableTestBedBuilder<TClass> {
```

**This is non-breaking** - old code still works.

---

## API Surface

### Methods Available

```typescript
// Existing (unchanged):
.expose(dep: Type) - Whitelist real dependencies
.mock(dep).impl(...) - Custom mock behavior
.mock(dep).final(...) - Plain value injection
.compile() - Build test bed

// New:
.boundaries(deps: Type[]) - Auto-expose everything except these
```

---

## Examples

### Example 1: QozbroQqn's Use Case

```typescript
TestBed.sociable(UserService)
  .boundaries([PrismaService, HttpClient])
  .compile();

// All class dependencies → Real (auto-exposed)
// Token injections → Auto-mocked
// PrismaService, HttpClient → Mocked (boundaries)
```

---

### Example 2: Custom Mock Behavior

```typescript
TestBed.sociable(UserService)
  .boundaries([PrismaService])
  .mock(HttpClient).impl((stub) => ({
    get: stub().mockResolvedValue({ data: 'test' })
  }))
  .compile();
```

---

### Example 3: Backwards Compatible (v3.x style)

```typescript
TestBed.sociable(UserService)
  .expose(AuthService)
  .expose(EmailService)
  .compile();

// Works exactly as before - no breaking changes
```

---

### Example 4: Explicit Mocking (No Auto-Expose)

```typescript
TestBed.sociable(UserService)
  .mock(AuthService).impl(mockAuth)
  .mock(EmailService).impl(mockEmail)
  .compile();

// Everything explicitly mocked - no auto-expose
```

---

## What We're NOT Doing

### ❌ No Fail-Fast

**Why**: Current auto-mocking behavior works fine. QozbroQqn's problem is solved by auto-expose, not fail-fast.

### ❌ No `.exposeAll()`

**Why**: `.boundaries()` already triggers auto-expose implicitly. Simpler.

### ❌ No Mode Concept

**Why**: No need for explicit modes. Behavior is determined naturally by which methods you call.

### ❌ No Mutual Exclusivity

**Why**: Let users mix approaches if they want (advanced use case).

---

## Migration Path

### For Current Users (v3.x)

**No changes required!** Existing code works exactly the same.

```typescript
// v3.x code:
TestBed.sociable(UserService)
  .expose(AuthService)
  .compile();

// v4.0.0: Works identically ✅
```

---

### For QozbroQqn's Team (New Pattern)

**Adopt new `.boundaries()` API**:

```typescript
// Old way (tedious):
.expose(A).expose(B).expose(C)
.expose(D).expose(E).expose(F)
.expose(G).expose(H).expose(I)
.expose(J).expose(K)

// New way (simple):
.boundaries([PrismaService])
```

---

## Timeline

### v4.0.0-alpha.1 (1 week)

- Add `.boundaries()` method
- Implement auto-expose logic
- Update type signatures
- Add tests

### v4.0.0-beta.0 (1 week)

- Beta testing with QozbroQqn's team
- Gather feedback
- Refine if needed

### v4.0.0 stable (1 week)

- Documentation
- Migration guide
- Release

**Total: 3 weeks** (much faster than original 4-6 weeks plan)

---

## Success Criteria

### Technical
- ✅ Backwards compatible (no breaking changes to existing API)
- ✅ Solves QozbroQqn's "tedious exposure" problem
- ✅ Simple implementation (one new method, minimal logic changes)
- ✅ No performance regression

### User Experience
- ✅ QozbroQqn's team can adopt immediately
- ✅ Existing users unaffected
- ✅ Clear, simple mental model
- ✅ No confusion about modes

---

## Documentation

### Concept: "Boundaries"

**Boundaries are dependencies you want mocked instead of real**

**Use cases**:
- External I/O (databases, HTTP clients)
- Expensive services (complex computation)
- Flaky services (non-deterministic behavior)

**Note**: Token injections (`@Inject('TOKEN')`) are automatically mocked - no need to declare them as boundaries.

---

### When to Use What

**Use `.expose()`** when:
- You want explicit control over what's real
- Testing specific collaboration patterns
- Small number of dependencies

**Use `.boundaries()`** when:
- You want most things real
- Large dependency tree
- Only care about excluding specific boundaries

**Use `.mock().impl()`** when:
- You want custom mock behavior
- Testing edge cases
- Need to control return values

---

## Summary

**What changed**:
- ✅ Added `.boundaries()` method
- ✅ Auto-expose logic when boundaries used
- ✅ Type signature relaxed

**What stayed the same**:
- ✅ All existing APIs work identically
- ✅ Auto-mocking behavior unchanged for `.expose()` users
- ✅ Token injections still auto-mocked

**Result**:
- ✅ Solves QozbroQqn's problem (tedious exposure)
- ✅ Zero breaking changes
- ✅ Simple to understand and implement
- ✅ Fast delivery (3 weeks)

---

## The Bottom Line

**Single new feature**: `.boundaries([...])` triggers auto-expose mode

**That's it.** Simple, effective, non-breaking.
