---
name: di-testing-with-suites
version: "3.x"
audience: agent
---

# DI Testing with Suites (v3)

Use this skill whenever you write or modify a unit test for a class managed by NestJS or InversifyJS. The v3 TestBed API replaces hand-rolled mocks, `Test.createTestingModule`, and Inversify container wiring.

## The Three Primitives

You will only call three things:

1. `TestBed.solitary(Class)` returns a builder. All constructor dependencies become auto-generated mocks.
2. `TestBed.sociable(Class)` returns a builder. Use `.expose(OtherClass)` to keep specific collaborators real. Everything else stays mocked.
3. `unitRef.get(identifier)` returns the mock for a dependency. Pass the class for class deps, the string or symbol for token deps.

Both builders end with `.compile()`, which is async and returns `{ unit, unitRef }`. `unit` is the real instance of the class under test.

Never import `@nestjs/testing`. Never call `Test.createTestingModule`. Never declare a `providers: []` array. Never build an Inversify `Container` in tests.

## Solitary Mode

Use solitary tests to verify one class in complete isolation. Every dep (class or token) comes back as a `Mocked<T>` with all methods auto-stubbed.

### NestJS + Jest

```ts
import { Injectable, Inject } from '@nestjs/common';
import { TestBed, type Mocked } from '@suites/unit';

interface AppConfig { apiUrl: string }

@Injectable()
export class UserRepository {
  async findById(id: string): Promise<{ id: string; name: string } | null> {
    return null;
  }
}

@Injectable()
export class UserService {
  constructor(
    private readonly repo: UserRepository,
    @Inject('CONFIG') private readonly config: AppConfig,
  ) {}

  async getName(id: string): Promise<string | null> {
    const user = await this.repo.findById(id);
    return user ? user.name : null;
  }
}

describe('UserService (solitary)', () => {
  let service: UserService;
  let repo: Mocked<UserRepository>;
  let config: Mocked<AppConfig>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();
    service = unit;
    repo = unitRef.get(UserRepository);
    config = unitRef.get<AppConfig>('CONFIG');
  });

  it('returns the user name when present', async () => {
    repo.findById.mockResolvedValue({ id: '1', name: 'Ada' });
    await expect(service.getName('1')).resolves.toBe('Ada');
    expect(repo.findById).toHaveBeenCalledWith('1');
  });
});
```

Retrieve a class mock with `unitRef.get(ClassName)`. Retrieve a token mock with `unitRef.get<Type>('TOKEN_STRING')` or `unitRef.get<Type>(SYMBOL_TOKEN)`. Configure return values per test inside `it` blocks.

### InversifyJS + Vitest

```ts
import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { describe, it, expect, beforeAll } from 'vitest';
import { TestBed, type Mocked } from '@suites/unit';

interface Logger { info(msg: string): void }

@injectable()
export class UserRepository {
  async findById(id: string): Promise<{ id: string; name: string } | null> {
    return null;
  }
}

@injectable()
export class UserService {
  constructor(
    @inject(UserRepository) private readonly repo: UserRepository,
    @inject('Logger') private readonly logger: Logger,
  ) {}

  async getName(id: string): Promise<string | null> {
    this.logger.info(`fetch ${id}`);
    const user = await this.repo.findById(id);
    return user ? user.name : null;
  }
}

describe('UserService (Inversify solitary)', () => {
  let service: UserService;
  let repo: Mocked<UserRepository>;
  let logger: Mocked<Logger>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();
    service = unit;
    repo = unitRef.get(UserRepository);
    logger = unitRef.get<Logger>('Logger');
  });

  it('logs and returns name', async () => {
    repo.findById.mockResolvedValue({ id: '1', name: 'Ada' });
    await expect(service.getName('1')).resolves.toBe('Ada');
    expect(logger.info).toHaveBeenCalledWith('fetch 1');
  });
});
```

`import 'reflect-metadata'` is mandatory once per Inversify test file (or via a setup file).

## Sociable Mode

Use sociable tests to verify a class together with the real implementations of selected collaborators. Sociable tests are still unit tests because token-injected deps (DBs, HTTP clients, caches) remain mocked. `.expose(Class)` accepts a class constructor only; everything not exposed stays mocked. You cannot retrieve an exposed class via `unitRef.get()`; it is the real instance.

```ts
import { Injectable, Inject } from '@nestjs/common';
import { TestBed, type Mocked } from '@suites/unit';

interface Database { users: { save(u: { email: string }): Promise<{ id: number; email: string }> } }

@Injectable()
export class EmailValidator {
  isValid(email: string): boolean {
    return email.includes('@') && email.includes('.');
  }
}

@Injectable()
export class UserService {
  constructor(
    private readonly validator: EmailValidator,
    @Inject('DATABASE') private readonly db: Database,
  ) {}

  async createUser(email: string) {
    if (!this.validator.isValid(email)) throw new Error('Invalid email');
    return this.db.users.save({ email });
  }
}

describe('UserService (sociable)', () => {
  let service: UserService;
  let db: Mocked<Database>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.sociable(UserService)
      .expose(EmailValidator)
      .compile();

    service = unit;
    db = unitRef.get<Database>('DATABASE');
  });

  it('saves a valid user through real validation', async () => {
    db.users.save.mockResolvedValue({ id: 1, email: 'a@b.io' });
    await expect(service.createUser('a@b.io')).resolves.toEqual({ id: 1, email: 'a@b.io' });
  });

  it('rejects invalid input via real validator', async () => {
    await expect(service.createUser('nope')).rejects.toThrow('Invalid email');
    expect(db.users.save).not.toHaveBeenCalled();
  });
});
```

To expose multiple classes, chain `.expose()` calls: `.expose(A).expose(B).expose(C)`.

## Token-Injected Dependencies Are Natural Walls

Tokens are always mocked. This rule is absolute and applies in both solitary and sociable modes. A "token" is anything that is not a concrete class identifier:

- String tokens: `@Inject('CONFIG')`, `@inject('Logger')`
- Symbol tokens: `@Inject(Symbol.for('REDIS'))`, `@inject(TYPES.Repo)`
- Inversify `LazyServiceIdentifier`: `@inject(new LazyServiceIdentifier(() => AuthService))`
- NestJS-wrapped tokens: `@InjectRepository(Entity)` resolves to a string token via `getRepositoryToken`

Token-injected deps represent external boundaries (DB, HTTP, caches, config). Suites mocks them automatically. Never add a token to `.expose()`. Never write a manual mock for a token dep.

```ts
const cfg = unitRef.get<AppConfig>('CONFIG');
const repo = unitRef.get<Repository<User>>(getRepositoryToken(User) as string);
```

## Pre-Compile Configuration (Shared Across the File)

Use `.mock(dep).final(impl)` or `.mock(dep).impl(stubFn => ({...}))` before `.compile()` when every test in the file needs the same dep behavior. `.final()` freezes the mock and removes it from `unitRef.get()`; use it for static config and primitive tokens. `.impl()` keeps the mock retrievable so each test can refine it.

```ts
const { unit, unitRef } = await TestBed.solitary(PaymentService)
  .mock<AppConfig>('CONFIG')
  .final({ apiUrl: 'https://test.local', currency: 'USD' })
  .mock(PaymentGateway)
  .impl(stubFn => ({
    charge: stubFn().mockResolvedValue({ status: 'ok' }),
  }))
  .compile();

// CONFIG cannot be retrieved (final).
const gateway = unitRef.get(PaymentGateway);
gateway.charge.mockResolvedValueOnce({ status: 'declined' });
```

## Per-Test Configuration

For varying behavior across `it` blocks, leave the dep auto-mocked at compile time and configure it inside each test on the retrieved mock (`mockResolvedValue`, `mockReturnValue`, `mockResolvedValueOnce` for Jest/Vitest; `.resolves`/`.returns` for Sinon).

```ts
it('handles success', async () => {
  repo.findById.mockResolvedValue({ id: '1', name: 'Ada' });
  await expect(service.getName('1')).resolves.toBe('Ada');
});

it('handles missing user', async () => {
  repo.findById.mockResolvedValue(null);
  await expect(service.getName('1')).resolves.toBeNull();
});
```

## NestJS Specifics

`forwardRef(() => Class)` is resolved automatically. Retrieve by the plain class, not the wrapper:

```ts
@Injectable()
export class UserService {
  constructor(@Inject(forwardRef(() => AuthService)) private auth: AuthService) {}
}

const { unitRef } = await TestBed.solitary(UserService).compile();
const auth = unitRef.get(AuthService); // not forwardRef(...)
```

Required `tsconfig.json` flags: `"experimentalDecorators": true` and `"emitDecoratorMetadata": true`. Property injection (`@Inject(Dep) private dep!: Dep`) works the same as constructor injection.

## InversifyJS Specifics

`new LazyServiceIdentifier(() => Class)` is resolved automatically. Retrieve by the underlying class:

```ts
@injectable()
class UserService {
  constructor(
    @inject(new LazyServiceIdentifier(() => AuthService)) private auth: AuthService,
  ) {}
}

const auth = unitRef.get(AuthService);
```

For tagged or named bindings (multiple bindings sharing an identifier), pass metadata as the second argument:

```ts
const katana = unitRef.get<Weapon>('Weapon', { canThrow: false });
const shuriken = unitRef.get<Weapon>('Weapon', { canThrow: true });
```

Always start Inversify test files (or their setup file) with `import 'reflect-metadata'`.

## Doubles Adapter Selection

Install exactly one doubles adapter per project: `@suites/doubles.jest`, `@suites/doubles.vitest`, or `@suites/doubles.sinon`. Add a `global.d.ts` reference so `Mocked<T>` resolves from `@suites/unit`:

```ts
/// <reference types='@suites/doubles.jest/unit' />
/// <reference types='@suites/di.nestjs/types' />
```

Swap the two lines for your runner and DI adapter. Suites auto-detects the installed packages at runtime.

## What NOT to Do

- Do not use `Test.createTestingModule({ providers: [...] }).compile()` from `@nestjs/testing`. Replace with `TestBed.solitary` or `TestBed.sociable`.
- Do not create `new Container(); container.bind(...).to(...)` to wire test doubles. Replace with `TestBed.solitary`.
- Do not hand-build mock objects cast as `any` or `as unknown as Mocked<T>`. Use `unitRef.get(Class)`.
- Do not write a manual mock for a token dependency. Tokens are auto-mocked. Retrieve with `unitRef.get<T>('TOKEN')`.
- Do not call `jest.mock('@suites/...')` or `vi.mock('@suites/...')`. Never mock the Suites packages themselves.
- Do not call `jest.spyOn` on a real instance built outside TestBed. Get the mock with `unitRef.get(Dep)` and assert on it directly.
- Do not pass a token to `.expose()`. `.expose()` accepts class constructors only. Tokens are walls.
- Do not call `.boundaries([Class])` or `.collaborate().exclude([Class])`. Those APIs do not exist in v3. Use `.expose(Class)`.
- Do not call `.using({...})` on a mock. The v3 builder uses `.final(impl)` (immutable) and `.impl(stubFn => impl)` (retrievable).

## Decision Checklist

Before writing the test:

1. One class in isolation? `TestBed.solitary(Class)`.
2. One class plus selected real collaborators? `TestBed.sociable(Class).expose(Real1).expose(Real2)`.
3. External I/O dep (DB, HTTP, cache, config)? It is a token. Auto-mocked. Retrieve with `unitRef.get<T>('TOKEN')`.
4. Same fake in every test? Pre-compile with `.mock(dep).final(...)` or `.mock(dep).impl(...)`.
5. Different fake per test? Leave auto-mocked, configure in each `it` via the retrieved mock.

The whole v3 unit-testing API surface is `TestBed.solitary`, `TestBed.sociable`, `.expose`, `.mock().final`, `.mock().impl`, `.compile`, and `unitRef.get`.
