<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/suites-dev/suites/master/logo.png" alt="Logo" />
</p>

<h1 align="center">Suites (formerly Automock)</h1>

**Suites is a progressive, flexible unit-testing framework aimed at elevating the software testing experience within
backend systems working with dependency injection frameworks**.

Suites provides a unified testing experience that combines best practices, industry standards, and a wide range of
testing tools to help developers create robust, maintainable, and scalable test suites, thereby ensuring the development
of high-quality software.

[![Codecov Coverage](https://img.shields.io/codecov/c/github/suites-dev/suites/master.svg?style=flat-square)](https://codecov.io/gh/suites-dev/suites)
[![e2e](https://github.com/suites-dev/suites/actions/workflows/e2e.yml/badge.svg?branch=master)](https://github.com/suites-dev/suites/actions)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![npm downloads](https://img.shields.io/npm/dm/@suites/unit.svg?label=%40suites%2Funit)](https://npmjs.org/package/@suites/unit "View this project on npm")
![npm downloads](https://img.shields.io/npm/dm/@automock/jest.svg?label=%40automock%2Fjest)

[↗️ Visit Documentation](https://suites.dev/docs)

## ❤️ Share Your Suites Experience!

**Are you using Suites in your projects?** We've created a [community discussion](https://github.com/suites-dev/suites/discussions/categories/q-a) where teams and companies can share how they're using Suites in production.

👉 **[Join the discussion](https://github.com/suites-dev/suites/discussions/categories/q-a)** and tell us more :)

Your contributions help others discover best practices and see real-world applications of Suites!

## 🎯 What Problems Does Suites Solve?

Suites addresses several common challenges in testing DI-based applications:

- **⚙️ Complex Test Setup and Configuration** - Eliminate boilerplate with automated mocking and dependency wiring
- **🧩 Inconsistent Testing Practices** - Standardize testing approaches across teams with a consistent API
- **🧠 Steep Learning Curve** - Provide intuitive patterns that are easier for new developers to understand
- **💔 Brittle Tests** - Create tests that focus on behavior rather than implementation details
- **📈 Scaling Difficulties** - Maintain manageable complexity even as applications grow
- **🔌 Integration Challenges** - Seamlessly connect testing libraries with DI frameworks

For more details, see our [full explanation of problems solved](https://suites.dev/docs/overview/problems-solved/).

## 💻 Quick Example

Suites offers an alternative approach to writing unit tests for classes that greatly simplifies the process compared to
traditional mocking libraries and dependency injection frameworks.

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

    // 🔍 Retrieve a dependency (mock) from the unit reference
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

With `TestBed`, an instance of `UserService` is created with mock objects automatically generated for its dependencies.
During the test, you have direct access to the automatically generated mock object for the `Database` dependency.

<p align="right"><a href="https://suites.dev/docs/overview/quickstart">↗️ Quickstart Guide</a></p>

## 📦 Installation

First, install Suites' unit package:

```bash
$ npm i -D @suites/unit
```

Then, to fully integrate Suites with your dependency injection framework and testing library, install the corresponding
adapters for your project:

```bash
$ npm i -D @suites/doubles.jest @suites/di.nestjs
```

Suites will automatically detect the installed adapters and configure itself accordingly.

### Prerequisites

- **TypeScript project**: With decorators and metadata reflection enabled
- **Node.js environment**: Compatible with Node.js 16.x and above
- **Dependency injection framework**: One of the supported frameworks
- **Testing library**: One of the supported libraries

### Supported DI Frameworks

| DI Framework | Package Name           |
|--------------|------------------------|
| NestJS       | `@suites/di.nestjs`    |
| Inversify    | `@suites/di.inversify` |
| TSyringe     | Soon!                  |

### Supported Mocking Libraries

| Testing Library | Package Name             |
|-----------------|--------------------------|
| Jest            | `@suites/doubles.jest`   |
| Sinon           | `@suites/doubles.sinon`  |
| Vitest          | `@suites/doubles.vitest` |
| Bun             | Soon!                    |
| Deno            | Soon!                    |

## 🔄 Migrating from Automock

If you're currently using Automock, we've created a comprehensive migration guide to help you transition to Suites. The
guide covers all the changes and improvements, making the upgrade process smooth and straightforward.

[↗️ Migrating from Automock Guide](https://suites.dev/docs/overview/migrating-from-automock/)

Your support helps us continue improving Suites and developing new features!

## 📜 License

Distributed under the Apache (Apache-2.0) License. See `LICENSE` for more information. 
