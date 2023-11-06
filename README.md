[![npm version](https://img.shields.io/npm/v/@automock/jest/latest?label=%40automock%2Fjest)](https://npmjs.org/package/@automock/jest "View this project on npm")
[![npm downloads](https://img.shields.io/npm/dm/@automock/jest.svg?label=%40automock%2Fjest)](https://npmjs.org/package/@automock/jest "View this project on npm")
[![npm version](https://img.shields.io/npm/v/@automock/sinon/latest?label=%40automock%2Fsinon)](https://npmjs.org/package/@automock/sinon "View this project on npm")
[![npm downloads](https://img.shields.io/npm/dm/@automock/sinon.svg?label=%40automock%2Fsinon)](https://npmjs.org/package/@automock/sinon "View this project on npm")

[![Codecov Coverage](https://img.shields.io/codecov/c/github/automock/automock/master.svg?style=flat-square)](https://codecov.io/gh/automock/automock)
[![ci](https://github.com/automock/automock/actions/workflows/set-coverage.yml/badge.svg?branch=master)](https://github.com/automock/automock/actions)
[![e2e](https://github.com/automock/automock/actions/workflows/e2e.yml/badge.svg?branch=master)](https://github.com/automock/automock/actions)

<br />

<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/automock/automock/master/logo.png" alt="Logo" />
</p>

<h1 align="center">Automock</h1>

### [↗️ Documentation](https://automock.dev/docs) &nbsp;&nbsp; [↗️ API Reference](https://automock.dev/api-reference) &nbsp;&nbsp; [↗️ Example](https://automock.dev/docs/getting-started/examples)

Automock streamlines the unit testing process by auto-generating mock objects for class dependencies within dependency
injection environments. With compatibility across various DI and testing frameworks, Automock allows you to focus on
crafting test cases instead of manual mock configurations, enhancing your unit testing journey.

## Automock's Core Features

🚀 **Zero-Setup Mocking** - Dive straight into testing without the hassle. Automatically generate mock
objects, eliminate manual setup, and reduce boilerplate code.

🔍 **Type-Safe Mocks** - Leverage TypeScript's power with mocks that retain the same type information as real objects.
Write tests with confidence, knowing that type mismatches will be caught.

🔄 **Consistent Test Architecture** - Achieve a uniform approach to unit testing.
Your tests will follow a consistent syntax and structure, making them easier to read and maintain.

📈 **Optimized Performance** - By bypassing the DI container load, Automock's design ensures your unit tests run
significantly faster. This lets you focus on development without unnecessary waits.

🌐 **Community & Support** - Join a growing community of developers. Regular updates, comprehensive
documentation, and responsive support to ensure you get the most out of Automock.

## :package: Installation

To fully integrate Automock into your testing and dependency injection framework, **you'll need to install two packages:
Automock package for your chosen testing framework, and the corresponding adapter for your DI framework.**

1. Install the corresponding package for your testing framework:

```bash
$ npm i -D @automock/jest
```

For **Sinon**:

```bash
$ npm i -D @automock/sinon
```

2. And for your DI framework, install the appropriate Automock adapter (as a dev dependency):

| DI Framework | Package Name                   |
|--------------|--------------------------------|
| NestJS       | `@automock/adapters.nestjs`    |
| Inversify    | `@automock/adapters.inversify` |

No further configuration is required.

## :arrows_counterclockwise: Migrating from v1.x to v2.0

The NestJS adapter came pre-bundled in v1.x. In v2.0, you'll need to install it manually:

```bash
$ npm i -D @automock/adapters.nestjs
```

> For a detailed list of changes read Automock's [v2.0 Release Notes](https://github.
> com/automock/automock/releases/tag/v2.0.0).

That's about it. :smile_cat:

<p align="right"><a href="https://automock.dev/docs/migrating">↗️ Migration guide</a></p>

## :computer: Quick Example

Take a look at the following example (using Jest, but the same applies for Sinon):

```typescript
import { TestBed } from '@automock/jest';

export class Database {
  async getUsers(): Promise<User[]> { ... }
}

export class UserService {
  constructor(private database: Database) {}

  async getAllUsers(): Promise<User[]> {
    return this.database.getUsers();
  }
}

describe('User Service Unit Spec', () => {
  let userService: UserService;
  let database: jest.Mocked<Database>;

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(UserService).compile();
    userService = unit;
    database = unitRef.get(Database);
  });

  test('should return users from the database', async () => {
    const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
    database.getUsers.mockResolvedValue(mockUsers);

    const users = await userService.getAllUsers();

    expect(database.getUsers).toHaveBeenCalled();
    expect(users).toEqual(mockUsers);
  });
});
```

In this example, Automock simplifies the creation of mock objects and stubs for the `Database` dependency. By utilizing
the `TestBed`, you can create an instance of the `UserService` class with automatically generated mock objects for its
dependencies.

During the test, you can directly access the automatically created mock object for the `Database` dependency (database).
By stubbing the `getUsers()` method of the database mock object, you can define its behavior and ensure it resolves with
a specific set of mock users.

<p align="right"><a href="https://automock.dev/docs/getting-started/examples">↗️ For a full Step-by-Step example</a></p>

## :scroll: License

Distributed under the MIT License. See `LICENSE` for more information.
