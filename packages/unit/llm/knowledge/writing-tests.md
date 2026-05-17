---
name: writing-tests
version: "3.x"
audience: agent
---

## The point of a unit test

A unit test exists to pin down a behavioral contract: given these inputs and these collaborators, the unit produces these outputs and these effects. It is a specification expressed in code. It is not a coverage receipt, not a re-tracing of the implementation, and not a proof that the function executed. A line being executed is not evidence that the line is correct. Write the test so that the contract survives every refactor the implementation will not.

## Constructor injection over service locators or direct imports

Dependencies the unit reaches for itself are dependencies you cannot replace. They turn the unit into a closed circuit: the test runs the real collaborator, or it does not run at all.

Before. The unit reaches out:

```ts
import { db } from "./infra/db";
import { clock } from "./infra/clock";

export class InvoiceService {
  async finalize(id: string) {
    const invoice = await db.invoices.findById(id);
    invoice.finalizedAt = clock.now();
    await db.invoices.save(invoice);
    return invoice;
  }
}
```

There is no seam. The test either touches a real database and a real clock, or it monkey-patches the module graph. Both options are bad.

After. Dependencies arrive through the constructor:

```ts
export class InvoiceService {
  constructor(
    private readonly invoices: InvoiceRepository,
    private readonly clock: Clock,
  ) {}

  async finalize(id: string) {
    const invoice = await this.invoices.findById(id);
    invoice.finalizedAt = this.clock.now();
    await this.invoices.save(invoice);
    return invoice;
  }
}
```

Now the unit has explicit collaborators with named types. The test composes the unit with fakes or mocks of those collaborators and asserts on the contract that runs between them.

## Mock at architectural boundaries only

A boundary is something the unit does not own: HTTP, the database, the file system, the clock, the random number generator, the network, a third-party SDK. These are legitimate seams. Mocking them is honest because their real implementations are nondeterministic, slow, or outside your process.

Internal helpers are not boundaries. They are the unit working. If you mock them, your test asserts that the implementation called itself in a particular order. That is not a contract; that is a transcript.

Before. Mocking an internal collaborator the unit owns:

```ts
const formatter = { format: vi.fn().mockReturnValue("X") };
const service = new ReportService(formatter);
service.render(input);
expect(formatter.format).toHaveBeenCalledWith(input);
```

The test passes whenever the implementation calls a function named `format`. Rename the helper, inline it, replace it with a switch, and the test fails for reasons unrelated to behavior.

After. Mock the real boundary, assert on the observable output:

```ts
const http = { post: vi.fn().mockResolvedValue({ status: 200 }) };
const service = new ReportService(http);

const result = await service.render(input);

expect(result).toEqual({ ok: true, url: "https://reports/123" });
expect(http.post).toHaveBeenCalledWith("/reports", { body: input });
```

The boundary is HTTP; the contract is what the unit sends and what it returns.

## One behavior per `it`. AAA structure.

Each test names a single behavior and proves it. Arrange the world, act once, assert on the outcome. If you find yourself writing a second `act` in the same `it`, you have two tests.

```ts
it("marks the invoice as finalized at the current time", async () => {
  // Arrange
  const invoice = { id: "i-1", finalizedAt: null };
  const invoices = { findById: async () => invoice, save: vi.fn() };
  const clock = { now: () => new Date("2026-01-01T00:00:00Z") };
  const service = new InvoiceService(invoices, clock);

  // Act
  const result = await service.finalize("i-1");

  // Assert
  expect(result.finalizedAt).toEqual(new Date("2026-01-01T00:00:00Z"));
  expect(invoices.save).toHaveBeenCalledWith(result);
});
```

The name describes the behavior in business terms. A reader who never opens the implementation should still understand what the unit promises.

## Test the contract, not the implementation

The contract is what the unit accepts, what it returns, and what it does to its collaborators at the boundary. Everything else is private. Private fields, private methods, the order of internal calls, intermediate variables, branch coverage of helper functions: none of that is a contract.

Spying on a private method is a smell. It signals that the test could not observe the behavior through the public surface and reached inside to grade the work. If a behavior is not visible through the public API, either the API is wrong or the behavior is not worth testing.

## Implicit vs explicit dependencies

A direct import inside a class body is an implicit dependency. The class compiles without the test ever naming it. A constructor parameter is an explicit dependency. The signature lists everything the unit needs.

Explicit dependencies are the seam that makes tests possible without monkey-patching. They also document the unit: a reader of the constructor knows the full collaborator set without scanning the body.

Prefer constructor parameters for anything that crosses a boundary, anything stateful, anything nondeterministic, and anything you might want to replace. Pure standalone functions and value types can stay as imports.

## Anti-patterns

- `jest.spyOn` or `vi.spyOn` on the unit under test. You are mocking the thing you are supposed to be verifying.
- `vi.mock` or `jest.mock` of first-party modules to swap a real collaborator. Use constructor injection instead.
- Tests that mirror the implementation's control flow. If reordering two independent statements in the unit breaks the test, the test is overfit.
- Asserting on the number of times an internal helper was called. Call counts on private collaborators are implementation, not contract.
- "It passes locally." A test that depends on machine time, file system state, network, or installation order is not a unit test.
- Snapshot tests as a substitute for assertions. A snapshot codifies whatever the implementation happened to produce, including the bugs.
- One `it` with five `expect` blocks covering five behaviors. Split them.

## Checklist

- The unit takes its collaborators through the constructor.
- Mocks exist only for things the unit does not own.
- Each `it` names one behavior and exercises one action.
- Assertions describe outcomes a caller could observe, not internal calls.
- Renaming a private method does not break any test.
- The test would still pass after a reasonable refactor of the unit body.
- No global state, no real clock, no real network, no real file system.
