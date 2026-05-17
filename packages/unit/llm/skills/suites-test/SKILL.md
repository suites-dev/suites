---
name: suites-test
description: Use the Suites DI testing API correctly whenever a file imports from @suites/unit, @suites/doubles.*, or references TestBed. Prefer TestBed.solitary(ClassUnderTest) for isolated unit tests; TestBed.sociable(ClassUnderTest).expose(Collaborator) when a real class collaborator participates. Token-injected dependencies are auto-mocked by Suites; never hand-build mocks for them. Do NOT use Test.createTestingModule (NestJS native, not Suites) and do NOT mix the two. Always read node_modules/@suites/unit/dist/llm/knowledge/ for current API. TRIGGER on any edit to a file that imports @suites/* or contains TestBed.. SKIP for plain Jest/Vitest tests with no Suites import.
version: "1.0.0"
---

# Suites Testing

You are writing a test that uses Suites. Suites generates a `TestBed` for a class under test, reads its DI metadata, and produces auto-mocks for every dependency. Before writing, read the bundled knowledge files at `node_modules/@suites/unit/dist/llm/knowledge/` for the version installed in this project. The recipes below describe the v3 (master) API: `TestBed.solitary()`, `TestBed.sociable().expose()`, `.mock(Dep).final(impl)` (frozen, not retrievable), `.mock(Dep).impl(stubFn => impl)` (retrievable). Do NOT use `.using(...)`, `.boundaries(...)`, `.collaborate()`, or `.exclude()`: those are older syntax or different branches and will not compile against v3.

## Solitary recipe

Use `TestBed.solitary(ClassUnderTest)` when you want one class tested with every dependency replaced by an auto-mock. This is the default. Reach for it first.

```ts
import { TestBed, type Mocked } from '@suites/unit';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { EmailService } from './email.service';

describe('UserService (solitary)', () => {
  let service: UserService;
  let repo: Mocked<UserRepository>;
  let email: Mocked<EmailService>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();
    service = unit;
    repo = unitRef.get(UserRepository);
    email = unitRef.get(EmailService);
  });

  it('persists a new user and sends a welcome email', async () => {
    repo.save.mockResolvedValue({ id: 1, email: 'a@b.c' });

    const result = await service.createUser({ email: 'a@b.c' });

    expect(result.id).toBe(1);
    expect(email.sendWelcome).toHaveBeenCalledWith('a@b.c');
  });
});
```

Pre-compile configuration is available when several tests share the same default. Configure on the auto-mock retrieved from `unitRef` in `beforeAll`, or branch per-test in `beforeEach`.

## Sociable recipe

Use `TestBed.sociable(ClassUnderTest).expose(Collaborator)` when a real class collaborator is part of the behavior under test. Sociable tests are still unit tests: external I/O stays mocked. Use sociable when an inner business class is small, deterministic, and has no I/O of its own.

```ts
import { TestBed, type Mocked } from '@suites/unit';
import { UserService } from './user.service';
import { UserValidator } from './user.validator';
import { UserRepository } from './user.repository';
import { DATABASE_TOKEN, type Database } from './database';

describe('UserService (sociable)', () => {
  let service: UserService;
  let database: Mocked<Database>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.sociable(UserService)
      .expose(UserValidator)
      .expose(UserRepository)
      .compile();

    service = unit;
    database = unitRef.get<Database>(DATABASE_TOKEN);
  });

  it('rejects an invalid email through the real validator', async () => {
    await expect(service.createUser({ email: 'not-an-email' }))
      .rejects.toThrow(/email/i);
    expect(database.users.insert).not.toHaveBeenCalled();
  });

  it('inserts a valid user through the real repository', async () => {
    database.users.insert.mockResolvedValue({ id: 7, email: 'a@b.c' });

    const user = await service.createUser({ email: 'a@b.c' });

    expect(user.id).toBe(7);
    expect(database.users.insert).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@b.c' })
    );
  });
});
```

Only `.expose()` a class when its real behavior is what the test is verifying. Do not expose a class just because it exists.

## Token-injected dependencies

Token-injected dependencies (`@Inject('DATABASE')`, `@Inject(LOGGER_TOKEN)`, symbol or string tokens, repository tokens from TypeORM, etc.) are **natural walls** in the dependency graph. Suites mocks them automatically and unconditionally. You do not need to configure anything for them to be mocked.

`.expose(TOKEN)` does not work and is conceptually wrong. `.expose()` resolves a class constructor and instantiates the real class; a token is not a constructor, there is nothing to instantiate. Tokens represent external systems (database, HTTP client, cache, config). External systems are the boundary, they stay mocked.

Correct alternative: retrieve the auto-mock via `unitRef.get<T>(TOKEN)` after compile and configure it like any other mock.

```ts
const { unit, unitRef } = await TestBed.sociable(UserService)
  .expose(UserValidator)
  .compile();

const database = unitRef.get<Database>(DATABASE_TOKEN);
database.users.insert.mockResolvedValue({ id: 1 });

const logger = unitRef.get<Logger>('LOGGER');
logger.info.mockReturnValue(undefined);
```

If the constructor uses `@InjectRepository(UserEntity)` (TypeORM), retrieve with the repository token:

```ts
import { getRepositoryToken } from '@nestjs/typeorm';
const repo = unitRef.get<Repository<UserEntity>>(getRepositoryToken(UserEntity) as string);
```

For Inversify tagged or named bindings, pass the metadata as the second argument:

```ts
const katana = unitRef.get<Weapon>('Weapon', { canThrow: false });
const usersDb = unitRef.get<Database>('Database', { name: 'users' });
```

## Do NOT

- Do not use `Test.createTestingModule` from `@nestjs/testing`. That is NestJS's native test module; it bootstraps a full DI container and has nothing to do with Suites. Pick one tool per test file.
- Do not mix the two in the same file. If a spec imports both `TestBed` from `@suites/unit` and `Test` from `@nestjs/testing`, delete one.
- Do not hand-build mocks (`{ save: jest.fn(), find: jest.fn() }`) and pass them to a Suites TestBed. Every dependency is already auto-mocked. Configure the auto-mock retrieved from `unitRef`.
- Do not call `jest.mock` / `vi.mock` on the unit's collaborators. Suites already replaced them.
- Do not `.expose()` a token (string or symbol). Tokens are walls. Configure the auto-mock instead.
- Do not `.expose()` a class that performs real I/O. If exposing it would hit a network or database, it should be behind a token instead, refactor.
- Do not call `unit.something()` to wire dependencies after compile. Compile returns the fully wired unit.

## Per-test vs per-file configuration

- **`beforeAll` + compile once**, when every `it` in the file uses the same exposed collaborators. Cheaper. Reset per-test mock state in `beforeEach` if your runner does not do it for you.
- **`beforeEach` + compile per test**, when one test needs to expose something the others do not, or when shared mock state would leak between tests in confusing ways. Slower; only when needed.

Configure mock return values inside each `it` (or in a focused `beforeEach`) rather than at the top of the file. Tests should read top-to-bottom.

## Adapter selection

Suites separates the doubles library (Jest / Sinon / Vitest) from the DI adapter (NestJS / Inversify). Install one of each, plus `@suites/unit`.

| Concern | Package | Install when |
|---|---|---|
| Doubles | `@suites/doubles.jest` | Tests run under Jest |
| Doubles | `@suites/doubles.sinon` | Tests run under Sinon / Mocha |
| Doubles | `@suites/doubles.vitest` | Tests run under Vitest |
| DI | `@suites/di.nestjs` | Project uses `@Injectable()` / `@Inject()` |
| DI | `@suites/di.inversify` | Project uses `@injectable()` / `@inject()` |

Suites detects installed adapters automatically. Do not configure them manually unless the project README says so. Both adapters require `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json` and `import 'reflect-metadata'` at the entry of test files (Inversify especially).

## Quick checklist

- The file imports `TestBed` from `@suites/unit`, not `Test` from `@nestjs/testing`.
- The default choice is `TestBed.solitary(ClassUnderTest).compile()`.
- `.expose()` is used only when the test verifies the real behavior of an inner business class.
- Tokens are never passed to `.expose()`. Token mocks are accessed via `unitRef.get<T>(TOKEN)`.
- No hand-built mock objects, no `jest.mock` of collaborators, no `Test.createTestingModule`.
- Asserts target the unit's return value or the boundary mock's calls, not the unit's private methods.
- Doubles, DI adapter, and `@suites/unit` versions are aligned and present in `package.json`.
