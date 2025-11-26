# @suites/di.injection-js

**Testing adapter for unit testing injection-js applications with TypeScript**

[![npm version](https://badge.fury.io/js/%40suites%2Fdi.injection-js.svg)](https://badge.fury.io/js/%40suites%2Fdi.injection-js)
[![npm downloads](https://img.shields.io/npm/dm/%40suites%2Fdi.injection-js.svg?style=flat-square)](https://www.npmjs.com/package/@suites/di.injection-js)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## What is @suites/di.injection-js?

The injection-js adapter integrates [Suites](https://suites.dev) unit testing with injection-js dependency injection. TestBed analyzes classes decorated with `@Injectable()` and `@Inject()`, auto-generates mocks for all dependencies, and provides isolated unit tests for TypeScript applications using injection-js.

Supports injection-js patterns including `InjectionToken`, `Injector` configuration, optional dependencies, and multi-providers.

## Quick Start

```typescript
import { Injectable, Inject } from 'injection-js';
import { TestBed, type Mocked } from '@suites/unit';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository') private repository: UserRepository,
    @Inject('Logger') private logger: Logger
  ) {}

  async getUser(id: string) {
    this.logger.info(`Fetching user ${id}`);
    return this.repository.findById(id);
  }
}
```

```typescript
describe('User Service Unit Spec', () => {
  let userService: UserService;
  let repository: Mocked<UserRepository>;
  let logger: Mocked<Logger>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();
    userService = unit;
    repository = unitRef.get<UserRepository>('UserRepository');
    logger = unitRef.get<Logger>('Logger');
  });

  it('should fetch user from repository', async () => {
    repository.findById.mockResolvedValue({ id: '1', name: 'Alice' });

    const user = await userService.getUser('1');

    expect(user.name).toBe('Alice');
    expect(logger.info).toHaveBeenCalledWith('Fetching user 1');
  });
});
```

## Installation

```bash
npm install --save-dev @suites/unit @suites/di.injection-js @suites/doubles.jest
```

Or with Vitest:

```bash
npm install --save-dev @suites/unit @suites/di.injection-js @suites/doubles.vitest
```

**Peer dependencies:** Requires `injection-js` (>= 2.4) and `reflect-metadata`.

👉 [Complete installation guide](https://suites.dev/docs/get-started/installation)

## Key Features

- **Automatic Mock Generation** - Creates mocks for all injection-js `@Injectable()` decorated classes
- **Token-Based Injection** - Handles `@Inject()` decorators and `InjectionToken` patterns
- **Optional Dependencies** - Supports `@Optional()` decorator
- **Multi-Provider Support** - Handles multi-provider configurations
- **Type-Safe Mocks** - Full TypeScript support with proper type inference
- **Zero Configuration** - No changes required to existing injection-js applications

## injection-js Patterns

This adapter supports injection-js patterns including:

- `@Injectable()` class decorators
- `@Inject(token)` for dependency injection
- `InjectionToken` for type-safe tokens
- `@Optional()` for optional dependencies
- `@Self()` and `@SkipSelf()` for hierarchical injection
- Multi-providers with `multi: true`
- Class-based and value-based providers
- Factory providers
- Provider configurations

## Documentation

- [Suites Documentation](https://suites.dev/docs) - Complete testing guide and patterns
- [injection-js Documentation](https://github.com/mgechev/injection-js) - Framework reference
- [Getting Started](https://suites.dev/docs/get-started/quickstart) - 5-minute quickstart
- [Adapter Architecture](https://suites.dev/docs/fundamentals/adapters) - How adapters work

## Other DI Adapters

Suites supports multiple dependency injection frameworks:

- **[@suites/di.nestjs](https://www.npmjs.com/package/@suites/di.nestjs)** - Unit testing adapter for NestJS applications
- **[@suites/di.inversify](https://www.npmjs.com/package/@suites/di.inversify)** - Unit testing adapter for InversifyJS applications
- **@suites/di.injection-js** - Unit testing adapter for injection-js applications (this package)

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
