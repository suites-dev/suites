# Auto-Expose & Fail-Fast Design Discussion

## Background

This document captures the design discussion from [GitHub Discussion #655](https://github.com/suites-dev/suites/discussions/655) regarding two key features for improving sociable unit tests in Suites: **Auto-Expose** and **Fail-Fast**.

## The Core Problem: Lying Tests

A production user (QozbroQqn) from a large NestJS application (80+ modules, 500+ source files, 1000+ test files, 95%+ coverage) identified a critical issue with sociable tests:

> "As great as auto mocking might be, for sociable tests its becoming quite tedious and error prone exposing (or forgetting to) needed dependencies. Yesterday I had a case in which I wanted to test the result of a unit. I wrote a 'return' and a 'throws' test. Both were green even though I expected the 'throws' test to fail because I knew the needed dependency wasnt exposed."

### Why This Happens

When a dependency is NOT exposed in a sociable test, TestBed auto-mocks it and returns `undefined`. This can cause tests to silently pass when they should fail:

```typescript
// Example: Missing exposure leads to false green
describe(Foo, () => {
  it('throws if data does not contain "someVar"', () => {
    const { unit } = TestBed.sociable(Foo)
      .expose(A) // ❌ Forgot to expose D (transitive dependency of A)
      .compile();

    const data = { a: 1 };

    // This test passes even though it should fail!
    // D.doSmthAndThrow() returns undefined instead of throwing
    expect(() => unit.foo(data)).toThrow(...);
  });
});
```

### The Dependency Chain Problem

```typescript
class Foo {
  constructor(private readonly a: A) {}

  foo(data: Record<string, unknown>) {
    const someVar = data.someVar;
    return this.a.bar(someVar);
  }
}

class A {
  constructor(private readonly d: D) {}

  bar(arg?: string) {
    if (!arg) this.d.doSmthAndThrow(); // ← This is the real thrower
    return true;
  }
}

class D {
  doSmthAndThrow() {
    throw new Error('Invalid argument');
  }
}
```

If you test `Foo.foo` and forget to expose `D`, the test for "throws if someVar is missing" will pass even though `D.doSmthAndThrow()` returns `undefined` instead of throwing.

## Two Independent Solutions

### Solution 1: Auto-Expose (User Request)

**Origin**: Proposed by QozbroQqn in their initial feedback (Sept 3, 2025)

**Proposed API**:
```typescript
TestBed.sociable(SomeThing)
  .autoExpose()
  .without([PrismaService, OthersWhichShouldNotBeExposed])
  .compile();
```

**How it solves lying tests**: By automatically exposing all dependencies (and their transitive dependencies), you eliminate the possibility of forgetting to expose something. If nothing is forgotten, nothing returns `undefined` silently.

**Characteristics**:
- **Convenience**: Eliminates manual dependency listing
- **Prevention approach**: Don't let developers forget to expose
- **Limitation**: Still relies on silent `undefined` behavior; if the auto-expose logic has bugs or you use `.without([...])` incorrectly, you can still get lying tests

### Solution 2: Fail-Fast (Maintainer Response)

**Origin**: Proposed by omermorad in response (Sept 20, 2025)

**Proposed Design**:
```typescript
// Partial mode: Manual expose + fail-fast on unexposed
TestBed.sociable(Foo)
  .mode('partial')  // or default mode
  .expose(A, B)
  .compile();
// ✅ A and B work normally
// ❌ Any other dependency access throws immediately (no silent undefined)

// All mode: Auto-expose + boundary mocking
TestBed.sociable(Foo)
  .mode('all')
  .compile();
// ✅ All in-memory dependencies auto-exposed
// ✅ Boundaries (DB/HTTP/Queue) mocked by default
```

**How it solves lying tests**: By failing immediately when an unexposed dependency is accessed, you catch missing exposures immediately. Even if you manually expose and forget something, the test fails loudly.

**Characteristics**:
- **Safety**: Catches mistakes immediately with clear error messages
- **Detection approach**: Catch it immediately if developers forget
- **Works with manual exposure**: Doesn't require auto-expose to be effective

## The Proposed Two-Mode System

### Partial Mode (Default)
- Manually expose specific collaborators
- **Everything else fails fast if touched** (no silent `undefined`)
- Best for: Testing specific collaboration patterns with clear boundaries

### All Mode
- Auto-expose the transitive in-memory dependency graph
- Boundaries (DB/HTTP/Queue) stay mocked by default
- Best for: Ergonomic testing of complex dependency chains

## Key Insight: They Are Independent But Complementary

**Auto-Expose and Fail-Fast solve the same problem from different angles:**

| Feature | Problem Solved | Approach | Can Work Alone? |
|---------|---------------|----------|-----------------|
| **Auto-Expose** | Forgetting to expose dependencies | Prevention (don't let it happen) | Yes, but less safe |
| **Fail-Fast** | Silent `undefined` from unexposed deps | Detection (catch it immediately) | Yes, but less convenient |

**Combined Benefits:**
- **Partial mode**: Fail-fast without auto-expose (manual control + safety)
- **All mode**: Auto-expose with boundary respect (convenience + common sense defaults)

## User Feedback

From QozbroQqn (Oct 8, 2025):
> "Your proposals sound great. We would use `all`. I love the fail-fast idea with no silent `undefined`."

### Their Testing Philosophy

The user's team follows this rule:
> "Sociable tests expose all dependencies including dependencies of dependencies (except PrismaService or similar external APIs)"

**Rationale**:
> "Even though interaction between Foo and D exists on A, I still can change A's functions so that Foo should fail but wont if we mock D"

This means they want transitive exposure to ensure that changes in dependency chains are caught by tests further up the call stack.

## Design Principles (from omermorad)

### Philosophy
Suites embraces both solitary and sociable unit testing in the Fowler sense. The north star is **trust**: avoid brittle tests (false reds) and avoid **false greens**. Focus on behavior over implementation and keep I/O at clear boundaries.

### Design Smell Acknowledgment
Needing to expose many dependencies to exercise one behavior is itself a smell. It indicates:
- High fan-out
- Fuzzy boundaries
- Branch pressure that makes tests harder to trust and maintain

However, the reality is that real-world codebases have these issues, and Suites should provide safe, ergonomic ways to test them.

### Safe Defaults
- Fail-fast in Partial mode (no silent `undefined`)
- Boundaries respected in All mode (DB/HTTP/Queue mocked by default)
- Clear conflict rules: no mixing expose/boundary/mock on the same token

## Implementation Timeline

- **v4.0.0**: Critical fixes (NodeNext support, postinstall script issues) - Released as alpha
- **v4.1.0**: Auto-Expose & Fail-Fast features (planned)

## References

- [GitHub Discussion #655](https://github.com/suites-dev/suites/discussions/655)
- [Martin Fowler - Unit Test](https://martinfowler.com/bliki/UnitTest.html)
- [v4.0.0-alpha.0 Release](https://github.com/suites-dev/suites/releases/tag/v4.0.0-alpha.0)