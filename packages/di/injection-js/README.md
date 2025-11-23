# @suites/di.injectionjs

**Testing adapter that enables Suites unit testing for injection-js applications**

[![npm version](https://badge.fury.io/js/%40suites%2Fdi.injectionjs.svg)](https://badge.fury.io/js/%40suites%2Fdi.injectionjs)
[![npm downloads](https://img.shields.io/npm/dm/%40suites%2Fdi.injectionjs.svg?style=flat-square)](https://www.npmjs.com/package/@suites/di.injectionjs)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## What is @suites/di.injectionjs?

The injection-js adapter enables [Suites](https://suites.dev) to work with injection-js's Angular-style dependency
injection system. It automatically analyzes your services decorated with `@Injectable()` and `@Inject()`, creates test
doubles for all dependencies, and lets you write isolated unit tests without manual mock setup.

Perfect for testing Angular-style dependency injection outside of Angular. Works seamlessly with constructor injection,
property injection, and custom injection tokens.

## Quick Start

```typescript
import 'reflect-metadata';
import { Injectable, Inject, InjectionToken } from 'injection-js';
import { TestBed, type Mocked } from '@suites/unit';

const CONFIG_TOKEN = new InjectionToken<AppConfig>('config');

@Injectable()
export class UserService {
  constructor(
    private database: Database,
    @Inject(CONFIG_TOKEN) private config: AppConfig
  ) {}

  getUser(id: string) {
    const apiUrl = this.config.apiUrl;
    return this.database.findUser(id);
  }
}

describe('UserService', () => {
  let userService: UserService;
  let database: Mocked<Database>;
  let config: Mocked<AppConfig>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();
    userService = unit;
    database = unitRef.get(Database);
    config = unitRef.get(CONFIG_TOKEN);
  });

  it('should get user from database', () => {
    config.apiUrl = 'https://api.example.com';
    database.findUser.mockReturnValue({ id: '1', name: 'John' });

    const user = userService.getUser('1');

    expect(user.name).toBe('John');
    expect(database.findUser).toHaveBeenCalledWith('1');
  });
});
```

## Installation

```bash
npm install --save-dev @suites/unit @suites/di.injectionjs @suites/doubles.jest
```

Or with Vitest:

```bash
npm install --save-dev @suites/unit @suites/di.injectionjs @suites/doubles.vitest
```

**Peer dependencies:** Requires `injection-js` (>= 2.0) and `reflect-metadata`.

👉 [Complete installation guide](https://suites.dev/docs/get-started/installation)

## Key Features

- **Angular-Style DI** - Works with Angular's dependency injection patterns outside Angular
- **InjectionToken Support** - Full support for `@Inject()` decorators with injection tokens
- **Type-Based Injection** - Uses actual class types as identifiers (not strings)
- **ForwardRef Compatible** - Works with forward references for circular dependencies
- **Property Injection** - Supports both constructor and property-based injection
- **Type-Safe** - Full TypeScript support with proper type inference
- **Zero Configuration** - Drop-in testing solution for existing injection-js applications

## injection-js-Specific Patterns

This adapter understands injection-js patterns including:

- `@Injectable()` class decorators
- `@Inject(token)` for custom providers
- `InjectionToken` for type-safe tokens
- `forwardRef(() => Type)` for circular dependencies
- Property injection with `@Inject()` decorators
- Type-based and token-based injection

## Documentation

- [Suites Documentation](https://suites.dev/docs) - Complete testing guide and patterns
- [injection-js Documentation](https://github.com/mgechev/injection-js) - Framework reference
- [Getting Started](https://suites.dev/docs/get-started/quickstart) - 5-minute quickstart
- [Adapter Architecture](https://suites.dev/docs/fundamentals/adapters) - How adapters work

## Other DI Adapters

Suites supports multiple dependency injection frameworks through adapters:

- **[@suites/di.nestjs](https://www.npmjs.com/package/@suites/di.nestjs)** - Testing adapter for NestJS applications
- **[@suites/di.inversify](https://www.npmjs.com/package/@suites/di.inversify)** - Testing adapter for InversifyJS applications
- **@suites/di.injectionjs** - Testing adapter for `injection-js` applications (this package)

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
