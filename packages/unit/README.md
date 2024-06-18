<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/suites-dev/suites/master/logo.png" alt="Logo" />
</p>

<h1 align="center">Suites (formerly Automock)</h1>

Suites is an opinionated, flexible testing meta-framework aim at elevating the software testing experience within
backend systems. By integrating a wide array of testing tools into a cohesive framework, Suites simplifies the process
of creating reliable tests, thereby ensuring the development of high-quality software.

[![Codecov Coverage](https://img.shields.io/codecov/c/github/suites-dev/suites/master.svg?style=flat-square)](https://codecov.io/gh/suites-dev/suites)
[![e2e](https://github.com/suites-dev/suites/actions/workflows/e2e.yml/badge.svg?branch=master)](https://github.com/suites-dev/suites/actions)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
![npm downloads](https://img.shields.io/npm/dm/@automock/jest.svg?label=%40automock%2Fjest)

[↗️ Visit Documentation](https://suites.dev/docs) &nbsp;&nbsp; [↗️ API Reference](https://suites.dev/api-reference)

## Automock is now Suites! 🎉

**We are excited to announce that Automock has been rebranded to Suites**!

This change reflects our commitment to providing a comprehensive testing solution that caters to a broader range of
testing scenarios. The core features and functionality of the framework remain the same, but with a new name and a fresh
look.

[↗️ More Information](https://suites.dev/overview/the-shift-from-automock)
&nbsp;&nbsp;
[↗️ Migration Guide](https://suites.dev/docs/getting-started/migrating-from-automock)
&nbsp;&nbsp;
[↗️ Change Log](https://suites.dev/docs/getting-started/change-log)

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

<p align="right"><a href="https://suites.dev/docs/getting-started/examples">↗️ For more comprehensive examples</a></p>

## :package: Installation

First, install Suites' core package:

```bash
$ npm i -D @suites/unit
```

Then, to fully integrate Suites into your mocking and dependency injection frameworks, install the corresponding
adapters for your project. For example, to use Suites with Jest and NestJS you would run (alongside the core package):

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

Distributed under the MIT License. See `LICENSE` for more information.
