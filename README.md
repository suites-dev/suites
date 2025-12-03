<p align="center">
  <img width="150" src="https://raw.githubusercontent.com/suites-dev/suites/master/logo.png" alt="Logo" />
</p>

<h1 align="center">Suites</h1>

<p align="center">
A unit testing framework for TypeScript backends working with inversion of control and dependency injection
<br />
by <a href="https://github.com/omermorad"><strong>@omermorad</strong></a>
</p>

<div align="center">
  <a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/license-Apache_2.0-blue.svg" alt="license" /></a>
  <a href="https://github.com/suites-dev/suites/blob/master/CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" /></a>
  <a href="https://npmjs.org/package/@suites/unit"><img src="https://img.shields.io/npm/dm/@suites/unit.svg?label=%40suites%2Funit" alt="npm downloads" /></a>
  <a href="https://npmjs.org/package/@automock/jest"><img src="https://img.shields.io/npm/dm/@automock/jest.svg?label=%40automock%2Fjest" alt="npm downloads" /></a>
  <a href="https://buymeacoffee.com/omermoradd"><img src="https://img.shields.io/badge/-buy_me_a%C2%A0coffee-gray?logo=buy-me-a-coffee" alt="Buy Me A Coffee" /></a>
</div>

<h3 align="center">
  <a href="https://suites.dev">Docs</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://suites.dev/docs/get-started/quickstart">Getting Started</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://suites.dev/docs/get-started/why-suites">Why Suites</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://suites.dev/docs/guides">Guides</a>
</h3>

<p align="center">
<strong>Dependency Injection Frameworks:</strong> <a href="https://nestjs.com">NestJS</a> (<a href="https://docs.nestjs.com/recipes/suites">official</a>), <a href="https://inversify.io/">InversifyJS</a> (<a href="https://inversify.io/docs/ecosystem/suites/">official</a>)</a><br/>
<strong>Testing Libraries:</strong> <a href="https://jestjs.io">Jest</a>, <a href="https://vitest.dev">Vitest</a>, <a href="https://sinonjs.org">Sinon</a>
</p>
<p align="center">
Using Suites? <a href="https://github.com/suites-dev/suites/discussions/655">Share your experience</a>, and help us shape the future of Suites
</p>

## Features

### 👩‍💻 Declarative

Suites' declarative API creates fully-typed, isolated test environments with a single declaration. Suites auto-generates all mocks and wires dependencies automatically.

### ✅ Type-Safe Refactoring

Generate type-safe mocks bound to implementations, enabling confident refactors. Change constructors, add dependencies, rename methods - TypeScript catches breaking changes at compile time with no silent failures or manual mock updates.

### 🧩 Standardized Testing Across Teams

Suites enforces a single canonical API that works across NestJS, InversifyJS (and more dependency injection frameworks to come), so every team ships tests with the same pattern.

### ✨ AI Ready

One canonical pattern teaches LLM agents the entire API. Coding agents like Claude Code and Cursor write correct tests in a single pass with much less context consumption compared to manual mocking patterns.

## Examples

### Solitary Mode

**Solitary mode** tests a single unit in complete isolation - all dependencies are automatically mocked. Use this when
you want to test your unit's logic without any real dependencies.

[Learn more about Solitary Tests](https://suites.dev/docs/guides/solitary)

```typescript
import { TestBed, type Mocked } from '@suites/unit';

describe('User Service', () => {
  let userService: UserService; // Class under test
  let userApi: Mocked<UserApi>; // Mock instance
  let database: Mocked<Database>; // Mock instance

  beforeAll(async () => {
    // Create the test environment with automatic mocking
    const testBed = await TestBed.solitary(UserService).compile();

    userService = testBed.unit;
    // Retrieve the mock instances
    userApi = testBed.unitRef.get(UserApi);
    database = testBed.unitRef.get(Database);
  });

  it('should generate a random user and save to the database', async () => {
    const mockUser = { id: 1, name: 'John' } as User;
    userApi.getRandom.mockResolvedValue(mockUser);

    await userService.generateRandomUser();

    expect(database.saveUser).toHaveBeenCalledWith(mockUser);
  });
}
```

### How It Works

The test setup uses `TestBed.solitary()` to create an isolated testing environment:

1. **TestBed analyzes the class** - Reads `UserService` constructor to find `UserApi` and `Database` dependencies
2. **Automatic mocks are created** - Generates mock instances of `UserApi` and `Database` with all methods as stubs
3. **Dependencies are injected** - Wires the mocks into `UserService` constructor automatically
4. **Type-safe access** - Use `unitRef.get()` to retrieve mocks with full TypeScript support

No manual mock creation needed. `TestBed` handles dependency discovery, mock generation, and wiring automatically.

### Automatic Mocking of Dependencies

When using `TestBed.solitary()`, all dependencies are automatically mocked. Each method becomes a stub with no predefined responses. Configure stub responses in tests as needed.

```typescript
// These stubs start with no return values
userApi.getRandom  // Returns undefined by default
database.saveUser  // Returns undefined by default

// Configure them in your tests
userApi.getRandom.mockResolvedValue({ id: 1, name: 'John' });
database.saveUser.mockResolvedValue(42);
```

### Sociable Mode

**Sociable mode** tests how components work together. You choose which dependencies to keep real (using `.expose()`) while external I/O remains mocked. Use this when you want to test integration between multiple units.

[Learn more about Sociable Tests](https://suites.dev/docs/guides/sociable)

```typescript
import { TestBed, type Mocked } from '@suites/unit';

describe('User Service', () => {
  let userService: UserService; // Class under test
  let database: Mocked<Database>; // Mock instance

  beforeAll(async () => {
    // Create test environment with real UserApi
    const testBed = await TestBed.sociable(UserService)
      .expose(UserApi) // Use real UserApi implementation
      .compile();

    userService = testBed.unit;
    database = testBed.unitRef.get(Database);
  });

  it('should generate a random user and save to the database', async () => {
    await userService.generateRandomUser();

    expect(database.saveUser).toHaveBeenCalled();
  });
}
```

## Prerequisites

Before installing Suites, ensure your project meets these requirements:

- **Dependency Injection Framework**: NestJS, InversifyJS, or plain TypeScript classes with constructor injection
- **Testing Library**: Jest, Vitest, or Sinon

## Installation

First, install Suites' unit package:

```bash
npm i -D @suites/unit
# or
yarn add -D @suites/unit
# or
pnpm add -D @suites/unit
```

Then, install **ONE** adapter for your DI framework and **ONE** adapter for your testing library:

**DI Framework Adapters:**
- **NestJS** - `@suites/di.nestjs`
- **InversifyJS** - `@suites/di.inversify`

**Testing Library Adapters:**
- **Jest** - `@suites/doubles.jest`
- **Vitest** - `@suites/doubles.vitest`
- **Sinon** - `@suites/doubles.sinon`

**Example for NestJS + Jest:**
```bash
npm i -D @suites/doubles.jest @suites/di.nestjs
# or
yarn add -D @suites/doubles.jest @suites/di.nestjs
# or
pnpm add -D @suites/doubles.jest @suites/di.nestjs
```

> **Note:** If you're using NestJS or Inversify, you'll also need to install `reflect-metadata` as a runtime dependency (not a dev dependency):
> ```bash
> npm i reflect-metadata
> ```

For complete installation instructions, see the [Installation Guide](https://suites.dev/docs/get-started/installation).

## Configuration

### Type Definitions

Create a `global.d.ts` file in your project root (or in your test directory) to enable proper TypeScript support:

```typescript
/// <reference types='@suites/doubles.jest/unit' />
/// <reference types='@suites/di.nestjs/metadata' />
```

Replace `@suites/doubles.jest` and `@suites/di.nestjs` with your chosen adapters.

For detailed configuration instructions, see the [Installation Guide](https://suites.dev/docs/get-started/installation).

### Contributing

We welcome contributions to Suites! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

## Share Your Suites Experience!

**Are you using Suites in your projects?** We've created a [community discussion](https://github.com/suites-dev/suites/discussions/categories/q-a) where teams and companies can share how they're using Suites in production.

👉 **[Join the discussion](https://github.com/suites-dev/suites/discussions/categories/q-a)** and tell us more :)

Your contributions help others discover best practices and see real-world applications of Suites!

## Migrating from Automock

If you're currently using Automock, we've created a comprehensive migration guide to help you transition to Suites. The
guide covers all the changes and improvements, making the upgrade process smooth and straightforward.

[↗️ Migrating from Automock Guide](https://suites.dev/docs/migration-guides/from-automock)

Your support helps us continue improving Suites and developing new features!

## Support the Project

<a href="https://buymeacoffee.com/omermoradd" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📜 License

Suites is licensed under the [Apache License, Version 2.0](LICENSE).
