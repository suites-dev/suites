---
name: solitary-vs-sociable
version: "3.x"
audience: agent
---

## Default rule

Default to solitary. Reach for sociable only when the behavior under test is the orchestration of real collaborators, and a solitary test cannot express that contract without lying.

Solitary is the safer choice for the same reasons a small surface is safer than a wide one. Every real collaborator you pull in is another class whose construction, side effects, and bugs leak into the test. Sociable mode earns its place when collaborator interaction is the point of the test, not when it is incidental.

## Solitary in one sentence

`TestBed.solitary(Class)` builds the unit with every constructor dependency auto-mocked, so the test pins down the unit's own behavior in isolation.

```ts
const { unit, unitRef } = await TestBed.solitary(UserService).compile();
const userApi = unitRef.get(UserApi);
userApi.getRandom.mockResolvedValue({ id: 1, name: 'John' });
```

## Sociable in one sentence

`TestBed.sociable(Class).expose(Collaborator)` builds the unit with everything still auto-mocked by default, then promotes the listed collaborators to their real implementations so the test exercises the real wiring between them.

```ts
const { unit, unitRef } = await TestBed.sociable(OrderService)
  .expose(PricingService)
  .expose(TaxCalculator)
  .compile();
```

## Token-injected dependencies are walls (LOAD-BEARING)

Anything injected by a non-class identifier is always auto-mocked. This includes:

- `@Inject('STRING_TOKEN')` (string tokens)
- `@Inject(SYMBOL_TOKEN)` (symbol tokens)
- `LazyServiceIdentifier` wrappers
- Any identifier where `typeof identifier !== 'function'`

Token resolution fires before mode-specific logic. `.expose('DATABASE')` is meaningless and silently ignored: the token has no constructor, so there is nothing to instantiate as real. The same is true for symbols and lazy identifiers. If you want a real implementation of a thing, that thing must be a class.

Wrong. The token cannot be exposed:

```ts
@Injectable()
export class UserService {
  constructor(
    private readonly validator: EmailValidator,
    @Inject('DATABASE') private readonly db: DatabaseClient,
  ) {}
}

const { unit } = await TestBed.sociable(UserService)
  .expose(EmailValidator)
  .expose('DATABASE') // useless, the token stays mocked
  .compile();
```

Right. The token stays mocked, and you configure it through `unitRef`:

```ts
const { unit, unitRef } = await TestBed.sociable(UserService)
  .expose(EmailValidator)
  .compile();

const db = unitRef.get<DatabaseClient>('DATABASE');
db.users.save.mockResolvedValue({ id: 1, email: 'a@b.co' });
```

The corollary is liberating. You never have to think about I/O when picking a mode. Databases, HTTP clients, caches, and config providers are injected through tokens by convention, so they are mocked for free. Sociable tests stay unit tests because the I/O boundary is a natural wall, not something the agent has to remember to plug.

## When sociable is right

Pick sociable when the answer to "what is being tested?" includes a verb between two classes.

- Pricing pipelines: `OrderService` calls `PricingService` calls `DiscountEngine`, and the bug surface is the composition. Stubbing the pricing return value would force the test to encode the very arithmetic you want to verify.
- Validation chains: `UserService` delegates to `EmailValidator`, and the validator's real rules are part of the contract you care about. Mocking `isValid` to return `true` proves nothing about the rules.
- Policy and rule objects: small pure classes where stubbing the return value is equivalent to copying the production logic into the test. Expose them and let the real code run.
- Refactor coverage during graph reshuffles: when extracting a helper class out of a unit, sociable mode keeps the existing test honest across the move without rewriting every assertion.

## When sociable is wrong

Pick solitary (or refactor first) when any of the following holds.

- The collaborator does I/O, even indirectly. Move the I/O behind a token and let it auto-mock. Do not expose a class that wraps a database call.
- The collaborator has module-level side effects: top-level await, lifecycle hooks that fire on construction, global singletons that self-initialize. Real instantiation runs that code, and the test pays for it on every run.
- The collaborator is expensive: ML inference, heavy parsing, large fixtures, schema compilation. The test gets slow and flaky for no behavioral gain over a stubbed return.
- The bug under test lives entirely inside the unit. Pulling in real collaborators widens blast radius when something breaks and makes failure attribution harder.

## Side effects in sociable mode

Sociable mode constructs real classes. Anything those classes do at import time or in their constructor will execute during the test, and Suites cannot intercept it. The most common offenders:

- Top-level await: `export const db = await connect()`
- Barrel files (`index.ts`) that re-export modules with side effects
- `NestFactory.create()` at module scope
- Lifecycle hooks invoked in the constructor
- Global singletons initialized eagerly
- Environment variable validation that throws on import
- `@Inject('CONFIG')` providers whose factory validates eagerly

If a collaborator triggers any of these, do not expose it. Either keep it mocked (in v3 non-exposed class deps come back as mocks with `undefined` returns, so configure them deliberately via `unitRef`), or refactor it behind a token so the wall fires automatically. `.expose()` cannot protect you from code that runs at import time. It only controls what happens during DI resolution, which is Phase 2; side effects already fired in Phase 1.

## Decision flowchart

```
Q1. Is the dependency injected by string token, symbol, or LazyServiceIdentifier?
     YES -> Already auto-mocked. Do not try to expose it. Configure through unitRef.
     NO  -> continue.

Q2. Is the behavior under test "this one class's logic"?
     YES -> TestBed.solitary(Class). Stop.
     NO  -> continue.

Q3. Is the behavior under test the interaction between this class and one or more real collaborators?
     NO  -> TestBed.solitary(Class). Stop.
     YES -> continue.

Q4. Does any candidate collaborator do I/O, run top-level side effects, or cost real time to instantiate?
     YES -> Refactor it behind a token, or keep it mocked. Do not expose.
     NO  -> continue.

Q5. Would stubbing the collaborator's return value be equivalent to copying its production logic into the test?
     YES -> Strong signal to expose it. The real class is the contract.
     NO  -> Lean toward solitary; the collaborator is a detail, not part of the unit's contract.

Q6. After exposing, do non-exposed class dependencies still have a sensible mocked default?
     YES -> TestBed.sociable(Class).expose(...).compile(). Configure remaining mocks via unitRef.
     NO  -> Drop back to solitary and configure stubs explicitly.
```

Apply the questions in order. The first three eliminate most cases without ever reaching for sociable. The last three keep sociable honest when you do.
