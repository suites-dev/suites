# @suites/di.injection-js

**Unit Testing for injection-js - Automatic mocking adapter for testing injection-js applications**

[![npm version](https://badge.fury.io/js/%40suites%2Fdi.injection-js.svg)](https://badge.fury.io/js/%40suites%2Fdi.injection-js)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

**Unit testing adapter for [injection-js](https://github.com/mgechev/injection-js) applications**. `@suites/di.injection-js` enables unit testing of injection-js services with automatic mock generation, making it simple to write isolated unit tests for your injection-js applications.

This adapter integrates injection-js's `@Injectable()` decorator system with [Suites](https://suites.dev) unit testing framework, automatically creating test doubles for all dependencies. Perfect for unit testing Angular-style dependency injection outside of Angular, this adapter eliminates manual mock setup and lets you focus on testing your injection-js services.

## Why Unit Test injection-js with Suites?

- **Automatic Mocking** - Unit test injection-js services without manually creating mocks
- **Zero Setup** - Start unit testing immediately with existing `@Injectable()` decorators
- **Type Safety** - Full TypeScript support for unit testing injection-js applications
- **Isolation** - True unit tests with complete dependency isolation
- **Developer Experience** - Intuitive API designed specifically for testing injection-js services

## Installation

```bash
npm install --save-dev @suites/di.injection-js injection-js reflect-metadata
```

## Key Features for Unit Testing injection-js

- 🎯 **Automatic Mock Generation** - All injection-js dependencies are automatically mocked in unit tests
- 🔍 **Type-Safe Unit Tests** - Full TypeScript type inference for mocks and injection-js dependencies
- 📦 **Type-Based Injection** - Unit test with actual class types as identifiers (not strings)
- 🎨 **Token Support** - Unit test injection-js `@Inject()` decorators for string/symbol tokens
- ⚡ **Zero Configuration** - Start unit testing injection-js applications immediately

## Quick Start - Unit Testing injection-js Services

```typescript
import 'reflect-metadata';
import { Injectable } from 'injection-js';
import { TestBed } from '@suites/unit';

@Injectable()
class UserService {
  constructor(private database: Database) {}

  getUser(id: string) {
    return this.database.findUser(id);
  }
}

// Unit test example for injection-js service
describe('UserService Unit Tests', () => {
  it('should get user from database', async () => {
    // Create isolated unit test with automatic mocks
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();

    const mockDatabase = unitRef.get(Database);
    mockDatabase.findUser.mockReturnValue({ id: '1', name: 'John' });

    const user = unit.getUser('1');

    expect(user.name).toBe('John');
  });
});
```

## Unit Testing injection-js Applications

### Testing Services with Dependencies

Unit test injection-js services with automatically mocked dependencies:

```typescript
import { Injectable } from 'injection-js';
import { TestBed } from '@suites/unit';

@Injectable()
class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService
  ) {}

  login(username: string, password: string) {
    const user = this.userService.authenticate(username, password);
    return this.tokenService.generate(user);
  }
}

// Unit test with automatic mocks
describe('AuthService Unit Tests', () => {
  it('should generate token for authenticated user', async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthService).compile();

    // Get automatically generated mocks
    const mockUserService = unitRef.get(UserService);
    const mockTokenService = unitRef.get(TokenService);

    mockUserService.authenticate.mockReturnValue({ id: '1', name: 'John' });
    mockTokenService.generate.mockReturnValue('token-123');

    const token = unit.login('john', 'password');

    expect(token).toBe('token-123');
    expect(mockUserService.authenticate).toHaveBeenCalledWith('john', 'password');
  });
});
```

### Testing with injection-js Tokens

Unit test injection-js services that use `@Inject()` decorators with string or symbol tokens:

```typescript
import { Injectable, Inject, InjectionToken } from 'injection-js';
import { TestBed } from '@suites/unit';

const CONFIG_TOKEN = new InjectionToken<Config>('config');

@Injectable()
class ConfigService {
  constructor(@Inject(CONFIG_TOKEN) private config: Config) {}

  getApiUrl() {
    return this.config.apiUrl;
  }
}

// Unit test with token injection
describe('ConfigService Unit Tests', () => {
  it('should return API URL from config', async () => {
    const { unit, unitRef } = await TestBed.solitary(ConfigService).compile();

    const mockConfig = unitRef.get(CONFIG_TOKEN);
    mockConfig.apiUrl = 'https://api.example.com';

    expect(unit.getApiUrl()).toBe('https://api.example.com');
  });
});
```

## Requirements

Enable decorator metadata in your `tsconfig.json` for unit testing injection-js:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Documentation

- 📘 [Suites Documentation](https://suites.dev/docs) - Complete guide to unit testing with Suites
- 🔧 [injection-js Documentation](https://github.com/mgechev/injection-js) - Learn about injection-js DI system
- 🚀 [Getting Started Guide](https://suites.dev/docs/getting-started) - Start unit testing in minutes

## Other Suites Unit Testing Adapters

Suites supports unit testing for multiple DI frameworks through adapters:

- `@suites/di.nestjs` - Unit testing for NestJS applications
- `@suites/di.inversify` - Unit testing for InversifyJS applications
- `@suites/di.injection-js` - Unit testing for injection-js applications (this package)

## License

Apache-2.0 © [Suites](https://suites.dev)