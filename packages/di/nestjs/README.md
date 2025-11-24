<p align="center">
  <img width="150" src="https://raw.githubusercontent.com/suites-dev/suites/master/logo.png" alt="Logo" />
  <img width="150" src="https://nestjs.com/img/logo-small.svg" alt="NestJS Logo" />
</p>

# @suites/di.nestjs

[Suites](https://suites.dev) unit testing adapter for [NestJS](https://nestjs.com). See official documentation [here](https://docs.nestjs.com/recipes/suites).

[![npm version](https://badge.fury.io/js/%40suites%2Fdi.nestjs.svg)](https://badge.fury.io/js/%40suites%2Fdi.nestjs)
[![npm downloads](https://img.shields.io/npm/dm/%40suites%2Fdi.nestjs.svg?style=flat-square)](https://www.npmjs.com/package/@suites/di.nestjs)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

If you are new to Suites: Suites is a unit testing framework for TypeScript backends using inversion of control and dependency injection. Check out our [getting started guide](https://suites.dev/docs/get-started/quickstart).

## What is @suites/di.nestjs?

The NestJS adapter integrates [Suites](https://suites.dev) unit testing with NestJS dependency injection. TestBed analyzes NestJS services decorated with `@Injectable()` and `@Inject()`, auto-generates mocks for all dependencies, and provides isolated unit tests for TypeScript applications using NestJS.

Supports NestJS providers, modules, constructor injection, property injection, and custom tokens.

## Unit Testing NestJS Services

Unit testing NestJS applications typically requires complex test module setup and provider overrides. This adapter automates mock generation and provides isolated testing without initializing the full NestJS module.

## Quick Start

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { TestBed, type Mocked } from '@suites/unit';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject('CONFIG') private readonly config: AppConfig
  ) {}

  async getUser(id: string) {
    const apiUrl = this.config.apiUrl;
    return this.userRepository.findById(id);
  }
}

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Mocked<UserRepository>;
  let config: Mocked<AppConfig>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();
    userService = unit;
    userRepository = unitRef.get(UserRepository);
    config = unitRef.get('CONFIG');
  });

  it('should fetch user from repository', async () => {
    config.apiUrl = 'https://api.example.com';
    userRepository.findById.mockResolvedValue({ id: '1', name: 'John' });

    const user = await userService.getUser('1');

    expect(user.name).toBe('John');
    expect(userRepository.findById).toHaveBeenCalledWith('1');
  });
});
```

## Installation

With Jest:

```bash
npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.jest
```

Or with Vitest:

```bash
npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.vitest
```

**Peer dependencies:** Requires `@nestjs/common` (>= 8.0) and `reflect-metadata`.

👉 [Complete installation guide](https://suites.dev/docs/get-started/installation)

## Key Features

- **Automatic Mock Generation** - Creates mocks for all NestJS `@Injectable()` decorated services
- **Token Injection** - Handles `@Inject()` decorators with string/symbol tokens
- **ForwardRef Compatible** - Supports NestJS `forwardRef()` for circular dependencies
- **Property Injection** - Supports constructor and property-based injection
- **Type-Safe Mocks** - Full TypeScript support with proper type inference
- **Zero Configuration** - No changes required to existing NestJS applications

## Supported NestJS Patterns

This adapter supports NestJS patterns including:

- `@Injectable()` class decorators
- `@Inject(token)` for custom providers
- `forwardRef(() => Type)` for circular dependencies
- Property injection with `@Inject()` decorators
- Custom token providers (strings, symbols, `InjectionToken`)
- Multi-provider tokens

## Requirements

Enable decorator metadata in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Best Practices

TestBed creates mocks for all dependencies automatically:

- Test business logic in isolation from dependencies
- Control mock behavior for different scenarios
- Verify interactions with injected services
- Avoid complex module configuration
- Run faster tests without full module initialization

## Documentation

- [Suites Documentation](https://suites.dev/docs) - Complete unit testing guide and patterns
- [Official NestJS Suites Recipe](https://docs.nestjs.com/recipes/suites) - Official NestJS documentation for Suites
- [Getting Started](https://suites.dev/docs/get-started/quickstart) - 5-minute quickstart guide
- [Adapter Architecture](https://suites.dev/docs/fundamentals/adapters) - How adapters work

## Other DI Adapters

Suites supports multiple dependency injection frameworks:

- **@suites/di.nestjs** - Unit testing adapter for NestJS applications (this package)
- **[@suites/di.inversify](https://www.npmjs.com/package/@suites/di.inversify)** - Unit testing adapter for InversifyJS applications

All adapters provide the same consistent testing API while handling framework-specific dependency injection patterns.

## Support & Community

- [GitHub Discussions](https://github.com/suites-dev/suites/discussions) - Ask questions and share ideas
- [Issue Tracker](https://github.com/suites-dev/suites/issues) - Report bugs or request features
- [Documentation](https://suites.dev/docs) - Comprehensive guides and examples
- [Examples](https://github.com/suites-dev/suites/tree/master/examples) - Real-world usage examples

## Contributing

We welcome contributions! See our [contribution guidelines](https://github.com/suites-dev/suites/blob/master/CONTRIBUTING.md) and [Code of Conduct](https://github.com/suites-dev/suites/blob/master/CODE_OF_CONDUCT.md).

## License

Apache-2.0 © [Suites](https://suites.dev)
