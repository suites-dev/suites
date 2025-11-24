<p align="center">
  <img width="150" src="https://raw.githubusercontent.com/suites-dev/suites/master/logo.png" alt="Logo" />
  <img width="150" src="https://inversify.io/img/logo.svg" alt="InversifyJS Logo" />
</p>

# @suites/di.inversify

[Suites](https://suites.dev) unit testing adapter for [InversifyJS](https://inversify.io). See official documentation [here](https://inversify.io/docs/ecosystem/suites/).

[![npm version](https://badge.fury.io/js/%40suites%2Fdi.inversify.svg)](https://badge.fury.io/js/%40suites%2Fdi.inversify)
[![npm downloads](https://img.shields.io/npm/dm/%40suites%2Fdi.inversify.svg?style=flat-square)](https://www.npmjs.com/package/@suites/di.inversify)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

If you are new to Suites: Suites is a unit testing framework for TypeScript backends using inversion of control and dependency injection. Check out our [getting started guide](https://suites.dev/docs/get-started/quickstart).

## What is @suites/di.inversify?

The InversifyJS adapter integrates [Suites](https://suites.dev) unit testing with InversifyJS dependency injection. TestBed analyzes classes decorated with `@injectable()` and `@inject()`, auto-generates mocks for all dependencies, and provides isolated unit tests for TypeScript applications using InversifyJS.

Supports InversifyJS patterns including bindings, identifiers, tagged dependencies, named dependencies, and multi-injection patterns.

## Unit Testing InversifyJS Services

Unit testing InversifyJS applications typically requires manual mock creation and container setup. This adapter automates mock generation and container configuration for isolated testing.

## Quick Start

```typescript
import { injectable, inject } from 'inversify';
import { TestBed, type Mocked } from '@suites/unit';

@injectable()
export class UserService {
  constructor(
    @inject('UserRepository') private repository: UserRepository,
    @inject('Logger') private logger: Logger
  ) {}

  async getUser(id: string) {
    this.logger.info(`Fetching user ${id}`);
    return this.repository.findById(id);
  }
}

describe('UserService', () => {
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

With Jest:

```bash
npm install --save-dev @suites/unit @suites/di.inversify @suites/doubles.jest
```

Or with Vitest:

```bash
npm install --save-dev @suites/unit @suites/di.inversify @suites/doubles.vitest
```

**Peer dependencies:** Requires `inversify` (>= 6.0) and `reflect-metadata`.

👉 [Complete installation guide](https://suites.dev/docs/get-started/installation)

## Key Features

- **Automatic Mock Generation** - Creates mocks for all InversifyJS `@injectable()` decorated classes
- **Tagged Dependencies** - Handles `@tagged()`, `@named()`, and metadata decorators
- **Multi-Injection** - Supports `@multiInject()` for array dependencies
- **LazyServiceIdentifier Compatible** - Supports lazy service resolution patterns
- **Type-Safe Mocks** - Full TypeScript support with proper type inference
- **Zero Configuration** - No changes required to existing InversifyJS applications

## Supported InversifyJS Patterns

This adapter supports InversifyJS patterns including:

- `@injectable()` class decorators
- `@inject(identifier)` for constructor-based injection
- `@multiInject(identifier)` for array injection
- `@tagged(key, value)` and `@named(name)` for metadata-driven injection
- `LazyServiceIdentifier` for lazy resolution
- `@unmanaged()` for non-injected parameters
- Symbol and string identifiers
- Interface-based service identifiers

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
- Verify interactions with injected dependencies
- Avoid complex container configuration
- Run faster tests without container overhead

## Documentation

- [Suites Documentation](https://suites.dev/docs) - Complete unit testing guide and patterns
- [Official InversifyJS Suites Page](https://inversify.io/docs/ecosystem/suites/) - Official InversifyJS documentation for Suites
- [Getting Started](https://suites.dev/docs/get-started/quickstart) - 5-minute quickstart guide
- [Adapter Architecture](https://suites.dev/docs/fundamentals/adapters) - How adapters work

## Other DI Adapters

Suites supports multiple dependency injection frameworks:

- **@suites/di.inversify** - Unit testing adapter for InversifyJS applications (this package)
- **[@suites/di.nestjs](https://www.npmjs.com/package/@suites/di.nestjs)** - Unit testing adapter for NestJS applications

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
