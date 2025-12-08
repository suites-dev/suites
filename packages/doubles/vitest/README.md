<p align="center">
  <img width="150" src="https://raw.githubusercontent.com/suites-dev/suites/master/logo.png" alt="Logo" />
  <img width="150" src="https://vitest.dev/logo.svg" alt="Vitest Logo" />
</p>

# @suites/doubles.vitest

[Suites](https://suites.dev) mocking adapter for [Vitest](https://vitest.dev).

[![npm version](https://badge.fury.io/js/%40suites%2Fdoubles.vitest.svg)](https://badge.fury.io/js/%40suites%2Fdoubles.vitest)
[![npm downloads](https://img.shields.io/npm/dm/%40suites%2Fdoubles.vitest.svg?style=flat-square)](https://www.npmjs.com/package/@suites/doubles.vitest)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

If you are new to Suites: Suites is a unit testing framework for TypeScript backends using inversion of control and dependency injection. Check out our [getting started guide](https://suites.dev/docs/get-started/quickstart).

## What is @suites/doubles.vitest?

The Vitest doubles adapter integrates [Suites](https://suites.dev) with Vitest's mocking capabilities. It provides automatic mock generation using `vi.fn()` and `@vitest/spy`, delivering type-safe mocked instances for all dependencies in your unit tests.

Uses Vitest's built-in mocking API for familiar patterns like `mockResolvedValue`, `mockReturnValue`, and `toHaveBeenCalledWith`.

## Mocking with Vitest

Manual mock setup in Vitest tests requires boilerplate for each dependency. This adapter auto-generates properly typed mocks that integrate seamlessly with Vitest's assertion API.

## Quick Start

```typescript
import { Injectable } from '@nestjs/common';
import { TestBed, type Mocked } from '@suites/unit';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger
  ) {}

  async getUser(id: string) {
    this.logger.info(`Fetching user ${id}`);
    return this.userRepository.findById(id);
  }
}

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Mocked<UserRepository>;
  let logger: Mocked<Logger>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();
    userService = unit;
    userRepository = unitRef.get(UserRepository);
    logger = unitRef.get(Logger);
  });

  it('should fetch user from repository', async () => {
    userRepository.findById.mockResolvedValue({ id: '1', name: 'John' });

    const user = await userService.getUser('1');

    expect(user.name).toBe('John');
    expect(logger.info).toHaveBeenCalledWith('Fetching user 1');
  });
});
```

## Installation

With NestJS:

```bash
npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.vitest
```

Or with InversifyJS:

```bash
npm install --save-dev @suites/unit @suites/di.inversify @suites/doubles.vitest
```

**Peer dependencies:** Requires `vitest` (>= 1.0) and `@vitest/spy` (>= 1.0).

👉 [Complete installation guide](https://suites.dev/docs/get-started/installation)

## Key Features

- **Automatic Mock Generation** - Creates `vi.fn()` mocks for all methods and properties
- **Type-Safe Mocks** - Full TypeScript support with `Mocked<T>` type inference
- **Vitest API Integration** - Use familiar patterns like `mockResolvedValue`, `mockImplementation`
- **Deep Mocking** - Nested objects are automatically mocked
- **Stub Functions** - Access raw `Mock` stubs via the `Stub` type
- **Zero Configuration** - Works out of the box with Vitest projects

## Mock API

The `Mocked<T>` type provides Vitest mock functions for all methods:

```typescript
// Return values
mock.method.mockReturnValue(value);
mock.method.mockReturnValueOnce(value);

// Async return values
mock.method.mockResolvedValue(value);
mock.method.mockRejectedValue(error);

// Custom implementations
mock.method.mockImplementation((args) => result);

// Assertions
expect(mock.method).toHaveBeenCalled();
expect(mock.method).toHaveBeenCalledWith(arg1, arg2);
expect(mock.method).toHaveBeenCalledTimes(3);
```

## Documentation

- [Suites Documentation](https://suites.dev/docs) - Complete unit testing guide and patterns
- [Vitest Mock Functions](https://vitest.dev/api/mock.html) - Vitest mocking API reference
- [Getting Started](https://suites.dev/docs/get-started/quickstart) - 5-minute quickstart guide
- [Adapter Architecture](https://suites.dev/docs/fundamentals/adapters) - How adapters work

## Other Doubles Adapters

Suites supports multiple mocking libraries:

- **@suites/doubles.vitest** - Mocking adapter for Vitest (this package)
- **[@suites/doubles.jest](https://www.npmjs.com/package/@suites/doubles.jest)** - Mocking adapter for Jest
- **[@suites/doubles.sinon](https://www.npmjs.com/package/@suites/doubles.sinon)** - Mocking adapter for Sinon

All adapters provide the same consistent `Mocked<T>` and `Stub` types while using framework-specific mocking implementations.

## Support & Community

- [GitHub Discussions](https://github.com/suites-dev/suites/discussions) - Ask questions and share ideas
- [Issue Tracker](https://github.com/suites-dev/suites/issues) - Report bugs or request features
- [Documentation](https://suites.dev/docs) - Comprehensive guides and examples
- [Examples](https://github.com/suites-dev/suites/tree/master/examples) - Real-world usage examples

## Contributing

We welcome contributions! See our [contribution guidelines](https://github.com/suites-dev/suites/blob/master/CONTRIBUTING.md) and [Code of Conduct](https://github.com/suites-dev/suites/blob/master/CODE_OF_CONDUCT.md).

## License

Apache-2.0 © [Suites](https://suites.dev)
