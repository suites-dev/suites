<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/automock/automock/master/logo.png" alt="Logo" />
</p>

<h1 align="center">Automock</h1>

<p>
<strong>Automock optimizes the unit testing process within dependency injection frameworks by providing a virtual, isolated environment and automated mock
generation, enabling developers to create efficient test suites and enhance their overall testing experience.</strong>
</p>

[![npm downloads](https://img.shields.io/npm/dm/@automock/jest.svg?label=%40automock%2Fjest)](https://npmjs.org/package/@automock/jest "View this project on npm")
[![npm downloads](https://img.shields.io/npm/dm/@automock/sinon.svg?label=%40automock%2Fsinon)](https://npmjs.org/package/@automock/sinon "View this project on npm")
[![Codecov Coverage](https://img.shields.io/codecov/c/github/automock/automock/master.svg?style=flat-square)](https://codecov.io/gh/automock/automock)
[![ci](https://github.com/automock/automock/actions/workflows/set-coverage.yml/badge.svg?branch=master)](https://github.com/automock/automock/actions)

[↗️ Documentation](https://automock.dev/docs) &nbsp;&nbsp; [↗️ API Reference](https://automock.dev/api-reference)

## Core Features

🚀 **Zero-Setup Mocking** - Automatically generate mock objects, eliminate manual setup, reduce boilerplate code.

🔍 **Type-Safe Mocks** - Leverage TypeScript's power with mocks that retain the same type as real objects.

📄 **Consistent Tests Structure** - Test suites will follow a consistent syntax and structure, making them easier to 
read and maintain.

📈 **Optimized Performance** - By bypassing the actual DI container, unit tests run significantly faster.

🌐 **Community & Support** - Join a growing community of developers.

## Quick Example

Take a look at the following example (using Jest, but the same applies for Sinon):

Consider the following `UserService` class:
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

Let's create a unit test for this class using Automock:
```typescript
import { TestBed } from '@automock/jest';
import { Database, UserService } from './user.service'; 

describe('User Service Unit Spec', () => {
  let userService: UserService; // 🧪 Declare the unit under test
  let database: jest.Mocked<Database>; // 🎭 Declare a mocked dependency

  beforeAll(() => {
    // 🚀 Create an isolated test env for the unit (under test) + auto generated mock objects
    const { unit, unitRef } = TestBed.create(UserService).compile(); 

    userService = unit;

    // 🔍 Retreive a dependency (mock) from the unit
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
the `Database` dependency (database). By stubbing the `getUsers()` method of the database mock object, we can define
its behavior and make sure it resolves with a specific set of mock users.

There is a lot more that Automock does rather than just generating mock objects, we recommend you to read the
[Getting Started](https://automock.dev/docs/getting-started) guide to learn more.

<p align="right"><a href="https://automock.dev/docs/getting-started/examples">↗️ For a full Step-by-Step example</a></p>

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

## :scroll: License

Distributed under the MIT License. See `LICENSE` for more information.
