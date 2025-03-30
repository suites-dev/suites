<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/suites-dev/suites/master/logo.png" alt="Logo" />
</p>

<h1 align="center">Suites (formerly Automock)</h1>

**Suites is a progressive, flexible testing meta-framework aimed at elevating the software testing experience within
backend systems working with dependency injection (DI) frameworks**.

Suites provides a unified testing experience that combines best practices, industry standards, and a wide range of
testing tools to help developers create robust, maintainable, and scalable test suites, thereby ensuring the development
of high-quality software.

[![Codecov Coverage](https://img.shields.io/codecov/c/github/suites-dev/suites/master.svg?style=flat-square)](https://codecov.io/gh/suites-dev/suites)
[![e2e](https://github.com/suites-dev/suites/actions/workflows/e2e.yml/badge.svg?branch=master)](https://github.com/suites-dev/suites/actions)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
![npm downloads](https://img.shields.io/npm/dm/@automock/jest.svg?label=%40automock%2Fjest)

[↗️ Visit Documentation](https://suites.dev/docs)

## Core Features

🚀 **Zero-Setup Mocking** - Automatically generate mock objects, eliminate manual setup, reduce boilerplate code.

🔍 **Type-Safe Mocks** - Leverage TypeScript's power with mocks that retain the same type as real objects.

📄 **Consistent Tests Structure** - Test suites will follow a consistent syntax and structure, making them easier to
read and maintain.

📈 **Optimized Performance** - By bypassing the actual DI container, unit tests run significantly faster.

🌐 **Community & Support** - Join a growing community of developers.

## :computer: Quick Example

Suites suggest an alternative approach to writing unit tests for classes instead of using the traditional mocking
libraries and dependency injection frameworks.

Take a look at the following example:

Consider the following `UserService` and `Database` classes:

```typescript
export class Database {
  async getUsers(): Promise<User[]> { ... }
}

export class UserService {
  constructor(private database: Database) {}

  async getAllUsers(): Promise<User[]> {
    return this.database.getUsers();
  }
}
```

Let's create a unit test for this class:

```typescript
import { TestBed, Mocked } from '@suites/unit';
import { Database, UserService } from './user.service'; 

describe('User Service Unit Spec', () => {
  let userService: UserService; // 🧪 Declare the unit under test
  let database: Mocked<Database>; // 🎭 Declare a mocked dependency

  beforeAll(async () => {
    // 🚀 Create an isolated test env for the unit (under test) + auto generated mock objects
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();

    userService = unit;

    // 🔍 Retreive a dependency (mock) from the unit reference
    database = unitRef.get(Database);
  });

  // ✅ Test test test
  test('should return users from the database', async () => {
    const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
    database.getUsers.mockResolvedValue(mockUsers);

    const users = await userService.getAllUsers();

    expect(database.getUsers).toHaveBeenCalled();
    expect(users).toEqual(mockUsers);
  });
});
```

With the use of the `TestBed`, an instance of the `UserService` class can be created with mock objects automatically
generated for its dependencies. During the test, we have direct access to the automatically generated mock object for
the `Database` dependency (database).

<p align="right"><a href="https://suites.dev/docs/overview/quickstart">↗️ Quickstart Guide</a></p>

## :package: Installation

First, install Suites' unit package:

```bash
$ npm i -D @suites/unit
```

Then, to fully integrate Suites into your mocking and dependency injection frameworks, install the corresponding
adapters for your project. For example, to use Suites with Jest and NestJS you would run (alongside the unit package):

```bash
$ npm i -D @suites/doubles.jest @suites/di.nestjs
````

Suites will automatically detect the installed adapters and configure itself accordingly.

### Supported DI Frameworks

| DI Framework | Package Name           |
|--------------|------------------------|
| NestJS       | `@suites/di.nestjs`    |
| Inversify    | `@suites/di.inversify` |
| TSyringe     | Soon!                  |

### Supported Mocking Libraries

| DI Framework | Package Name             |
|--------------|--------------------------|
| Jest         | `@suites/doubles.jest`   |
| Sinon        | `@suites/doubles.sinon`  |
| Vitest       | `@suites/doubles.vitest` |
| Bun          | Soon!                    |
| Deno         | Soon!                    |


## :scroll: License

Distributed under the Apache (Apache-2.0) License. See `LICENSE` for more information.
