---
name: writing-unit-tests
description: Apply universal unit-test discipline when writing or modifying test files in any TypeScript/JavaScript project. Use constructor injection over service-locator lookups; mock only at architectural boundaries (HTTP, DB, clock, randomness); never spy on internal methods of the unit under test; never use vi.mock or jest.mock on first-party modules; one behavior per it block; AAA structure. TRIGGER on any edit to *.spec.ts, *.test.ts, __tests__/*, files that add describe/it blocks, or questions like "how should I test this". SKIP for E2E or integration tests where boundary mocking rules invert.
version: "1.0.0"
---

# Writing Unit Tests

You are writing or modifying a unit test. A unit test verifies one piece of behavior by driving the unit under test through its public surface, with collaborators replaced only where they cross an architectural boundary. This skill encodes the rules. Follow them as written; they are not suggestions.

## Core principles

1. **Constructor inject, do not service-locate.** Pass collaborators in through the constructor (or factory parameters). Do not import singletons inside the unit, and do not reach for `container.get()` mid-method. If you cannot swap a collaborator from the test without monkey-patching, the design is wrong, fix the design first.

2. **Mock only at architectural boundaries.** A boundary is a place where your process talks to something it does not own: HTTP, database, message broker, file system, clock, randomness, external SDK. Everything inside that wall is real. First-party business logic is never a boundary.

3. **Never spy on internal methods of the unit under test.** The unit's private methods are not part of the contract. If a test asserts `expect(service.computeFoo).toHaveBeenCalled()`, the test will break on the next harmless refactor. Assert on observable behavior: return values, calls to boundary doubles, thrown errors, state changes you can read through the public API.

4. **Never `vi.mock`/`jest.mock` first-party modules.** Module-level mocking of your own code is a symptom of implicit dependencies. The fix is to make the dependency explicit through the constructor, not to patch the import system. Reserve module mocking for genuine boundaries you cannot otherwise inject (a third-party SDK that exports a default singleton, for example).

5. **One behavior per `it`.** Each test has one reason to fail. If your test name needs "and", split it. The Arrange / Act / Assert structure should be visible at a glance: setup, one call, one (logical) assertion block.

6. **Boundaries earn the asserts.** Verification is most valuable at the edges of the unit. Assert the value the caller receives, and assert the calls made to the boundary doubles. Do not assert intermediate computations.

## Common anti-patterns

### spyOn the unit under test

```ts
// WRONG: implementation-coupled, breaks on any rename
it('creates user', async () => {
  const spy = jest.spyOn(service as any, 'hashPassword');
  await service.createUser({ email: 'a@b.c', password: 'x' });
  expect(spy).toHaveBeenCalled();
});

// RIGHT: assert at the boundary the hash actually reaches
it('persists user with hashed password', async () => {
  await service.createUser({ email: 'a@b.c', password: 'x' });
  expect(userRepository.save).toHaveBeenCalledWith(
    expect.objectContaining({ email: 'a@b.c', passwordHash: expect.any(String) })
  );
});
```

### jest.mock of a first-party module

```ts
// WRONG: pretends the module system is the dependency boundary
jest.mock('../email/email-utils');
import { sendEmail } from '../email/email-utils';

// RIGHT: make EmailService explicit, inject it
class UserService {
  constructor(private readonly email: EmailService) {}
}
```

### Mocking a pure function

```ts
// WRONG: stubbing your own date formatter buys nothing and breaks on refactor
jest.spyOn(formatters, 'formatDate').mockReturnValue('2026-01-01');

// RIGHT: call it for real; assert the final output
expect(invoice.renderedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
```

### Multi-behavior test

```ts
// WRONG: one it covering three behaviors. One failure hides the others.
it('handles user creation', async () => {
  await expect(service.createUser({ email: '' })).rejects.toThrow();
  await service.createUser({ email: 'ok@x.com' });
  expect(repo.save).toHaveBeenCalled();
  await expect(service.createUser({ email: 'ok@x.com' })).rejects.toThrow();
});

// RIGHT: one behavior, one it
it('rejects empty email', async () => { /* ... */ });
it('persists a valid user', async () => { /* ... */ });
it('rejects duplicate email', async () => { /* ... */ });
```

## Quick checklist

- The unit's collaborators arrive through the constructor; the test wires them in.
- Doubles are placed at boundaries (HTTP, DB, clock, queue, SDK), nowhere else.
- No `spyOn` on a method of the unit under test.
- No `jest.mock` / `vi.mock` of first-party modules.
- Each `it` has one observable behavior in its name and one logical assertion block.
- Asserts target the return value, the boundary double, or a thrown error, not internal state.
- The test would still pass after an internal rename or extract-method refactor.

## When this skill does NOT apply

- **E2E tests** that drive the system through its real HTTP / CLI / UI surface. Boundary mocking inverts: you want real boundaries, with only third-party external services stubbed.
- **Integration tests** that exercise a real database, real broker, or real file system on purpose. Mocking those defeats the test's reason for existing.
- **Performance / load tests.** The discipline above is about correctness, not throughput.
- **Contract tests** against a published schema. Those verify the boundary itself; the rules here assume the boundary is given.

If the file you are editing is clearly one of the above (path contains `e2e`, `integration`, `bench`, or the file talks to real infrastructure), stop applying this skill and follow that suite's conventions instead.
