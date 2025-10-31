<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/suites-dev/suites/master/logo.png" alt="Logo" />
</p>

<h1 align="center">Suites</h1>

**Suites is a unit-testing framework for TypeScript backend systems working with dependency injection.**

[![Codecov Coverage](https://img.shields.io/codecov/c/github/suites-dev/suites/master.svg?style=flat-square)](https://codecov.io/gh/suites-dev/suites)
[![e2e](https://github.com/suites-dev/suites/actions/workflows/e2e.yml/badge.svg?branch=master)](https://github.com/suites-dev/suites/actions)
[![npm downloads](https://img.shields.io/npm/dm/@suites/unit.svg?label=%40suites%2Funit)](https://npmjs.org/package/@suites/unit "View this project on npm")
![npm downloads](https://img.shields.io/npm/dm/@automock/jest.svg?label=%40automock%2Fjest)

<p align="center">
  <a href="https://suites.dev">Documentation</a> | 
  <a href="https://suites.dev/docs/getting-started">Getting Started</a> | 
  <a href="https://suites.dev/docs/why-suites">Why Suites</a> |
  <a href="https://suites.dev/docs/developer-guide/unit-tests">Learn Suites</a>
</p>

<p align="center">
Works with: <a href="https://nestjs.com">NestJS</a> (<a href="https://docs.nestjs.com/recipes/suites">official</a>), <a href="https://inversify.io/">Inversify</a>, <a href="https://vitest.dev">Vitest</a>, <a href="https://sinonjs.org">Sinon</a>, <a href="https://jestjs.io">Jest</a>, and more
</p>

## Features

### 👩‍💻 Declarative

Suites provides an opinionated declarative API for unit testing: wrap your unit with a single call and receive a correct test environment for the unit’s dependencies. No more manual mocking and wiring up dependencies.

### ✅ Type-Safe

All the mocks created by Suites are type-safe, bound to the implementation and allows calling only the correct dependency methods - making sure refactors don't break your unit tests and there are no silent failures.

### 🕵️‍♂️ Smart Mock Tracking

Suites automatically tracks all dependency mocks used during your tests. If a test calls a mocked dependency method that has no return value or missing mock implementation, Suites will warn you immediately — preventing false-negative test failures and hidden logic gaps.


### ✨ AI Ready

With the concise and type safe format of Suites tests, coding agents (like Claude Code and Cursor) are able to write correct tests in a single pass.

## Example

### Solitary Mode

[Solitary mode](https://suites.dev/docs/developer-guide/unit-tests/solitary) is used to evaluate a single unit of work in complete isolation from its external dependencies

```typescript
import { TestBed, type Mocked } from '@suites/unit';

describe('User Service', () => {
  let userService: UserService; // 🧪 The unit we are testing
  let userApi: Mocked<UserApi>; // 🎭 The dependency we are mocking

  beforeAll(async () => {
    // 🚀 Create an isolated test env for the unit
    const testBed = await TestBed.solitary(UserService).compile();

    userService = testBed.unit;    
    // 🔍 Retrieve the unit's dependency mock - automatically generated
    userApi = testBed.unitRef.get(UserApi);
  });

  // ✅ Test test test
  it('should generate a random user and save to the database', async () => {
    userApi.getRandom.mockResolvedValue({id: 1, name: 'John'} as User);
    await userService.generateRandomUser();
    expect(database.saveUser).toHaveBeenCalledWith(userFixture);
  });
}
```

### Sociable Mode

[Sociable mode](https://suites.dev/docs/developer-guide/unit-tests/sociable) is used to evaluate a single unit of work in a real environment, with some dependencies mocked.

```typescript
import { TestBed, type Mocked } from '@suites/unit';

describe('User Service', () => {
  let userService: UserService; // 🧪 The unit we are testing
  let database: Mocked<Database>; // 🎭 The dependency we are mocking

  beforeAll(async () => {
    // 🚀 Create an isolated test env for the unit
    const testBed = await TestBed.sociable(UserService)
      .expose(UserApi) // 🔍 The dependency we are exposing
      .compile();

    userService = testBed.unit;
    database = testBed.unitRef.get(Database);
  });

  // ✅ Test test test
  it('should generate a random user and save to the database', async () => {
    await userService.generateRandomUser();
    expect(database.saveUser).toHaveBeenCalledWith(userFixture);
  });
}
```

## Installation

First, install Suites' unit package:

```bash
npm i -D @suites/unit
# or
yarn add -D @suites/unit
# or
pnpm add -D @suites/unit
```

Then, to fully integrate Suites with your dependency injection framework and testing library, install the corresponding
adapters for your project:

```bash
npm i -D @suites/doubles.jest @suites/di.nestjs
# or
yarn add -D @suites/doubles.jest @suites/di.nestjs
# or
pnpm add -D @suites/doubles.jest @suites/di.nestjs
```

#### DI Frameworks
 - **NestJS** - `@suites/di.nestjs`
 - **Inversify** - `@suites/di.inversify`
 - **TSyringe** - Soon!

#### Testing Libraries
 - **Jest** - `@suites/doubles.jest`
 - **Sinon** - `@suites/doubles.sinon`
 - **Vitest** - `@suites/doubles.vitest`
 - **Bun** - Soon!
 - **Deno** - Soon!

### Contributing

We welcome contributions to Suites! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

## ❤️ Share Your Suites Experience!

**Are you using Suites in your projects?** We've created a [community discussion](https://github.com/suites-dev/suites/discussions/categories/q-a) where teams and companies can share how they're using Suites in production.

👉 **[Join the discussion](https://github.com/suites-dev/suites/discussions/categories/q-a)** and tell us more :)

Your contributions help others discover best practices and see real-world applications of Suites!

## 🔄 Migrating from Automock

If you're currently using Automock, we've created a comprehensive migration guide to help you transition to Suites. The
guide covers all the changes and improvements, making the upgrade process smooth and straightforward.

[↗️ Migrating from Automock Guide](https://suites.dev/docs/overview/migrating-from-automock/)

Your support helps us continue improving Suites and developing new features!

## 📜 License

Suites is licensed under the [Apache License, Version 2.0](LICENSE).
