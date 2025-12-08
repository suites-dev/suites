<p align="center">
  <img width="150" src="https://raw.githubusercontent.com/suites-dev/suites/master/logo.png" alt="Logo" />
  <img width="150" src="https://sinonjs.org/assets/images/logo.png" alt="Sinon Logo" />
</p>

# @suites/doubles.sinon

[Suites](https://suites.dev) mocking adapter for [Sinon](https://sinonjs.org).

[![npm version](https://badge.fury.io/js/%40suites%2Fdoubles.sinon.svg)](https://badge.fury.io/js/%40suites%2Fdoubles.sinon)
[![npm downloads](https://img.shields.io/npm/dm/%40suites%2Fdoubles.sinon.svg?style=flat-square)](https://www.npmjs.com/package/@suites/doubles.sinon)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

If you are new to Suites: Suites is a unit testing framework for TypeScript backends using inversion of control and dependency injection. Check out our [getting started guide](https://suites.dev/docs/get-started/quickstart).

## What is @suites/doubles.sinon?

The Sinon doubles adapter integrates [Suites](https://suites.dev) with Sinon's mocking capabilities. It provides automatic mock generation using `sinon.stub()`, delivering type-safe mocked instances for all dependencies in your unit tests.

Uses Sinon's built-in stubbing API for patterns like `resolves`, `returns`, and `calledWith`. Works with any test runner (Mocha, Jasmine, etc.).

## Mocking with Sinon

Manual stub setup in Sinon tests requires boilerplate for each dependency. This adapter auto-generates properly typed stubs that integrate seamlessly with Sinon's assertion API.

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
    repository.findById.resolves({ id: '1', name: 'John' });

    const user = await userService.getUser('1');

    expect(user.name).to.equal('John');
    expect(logger.info.calledWith('Fetching user 1')).to.be.true;
  });
});
```

## Installation

With NestJS:

```bash
npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.sinon
```

Or with InversifyJS:

```bash
npm install --save-dev @suites/unit @suites/di.inversify @suites/doubles.sinon
```

**Peer dependencies:** Requires `sinon` and `@types/sinon`.

👉 [Complete installation guide](https://suites.dev/docs/get-started/installation)

## Key Features

- **Automatic Stub Generation** - Creates `sinon.stub()` for all methods and properties
- **Type-Safe Mocks** - Full TypeScript support with `Mocked<T>` type inference
- **Sinon API Integration** - Use familiar patterns like `resolves`, `returns`, `callsFake`
- **Deep Mocking** - Nested objects are automatically stubbed
- **Stub Functions** - Access raw `SinonStub` via the `Stub` type
- **Test Runner Agnostic** - Works with Mocha, Jasmine, or any test framework

## Mock API

The `Mocked<T>` type provides Sinon stubs for all methods:

```typescript
// Return values
mock.method.returns(value);
mock.method.returnsThis();

// Async return values
mock.method.resolves(value);
mock.method.rejects(error);

// Custom implementations
mock.method.callsFake((args) => result);

// Assertions
expect(mock.method.called).to.be.true;
expect(mock.method.calledWith(arg1, arg2)).to.be.true;
expect(mock.method.callCount).to.equal(3);
```

## Documentation

- [Suites Documentation](https://suites.dev/docs) - Complete unit testing guide and patterns
- [Sinon Stubs](https://sinonjs.org/releases/latest/stubs) - Sinon stubbing API reference
- [Getting Started](https://suites.dev/docs/get-started/quickstart) - 5-minute quickstart guide
- [Adapter Architecture](https://suites.dev/docs/fundamentals/adapters) - How adapters work

## Other Doubles Adapters

Suites supports multiple mocking libraries:

- **@suites/doubles.sinon** - Mocking adapter for Sinon (this package)
- **[@suites/doubles.jest](https://www.npmjs.com/package/@suites/doubles.jest)** - Mocking adapter for Jest
- **[@suites/doubles.vitest](https://www.npmjs.com/package/@suites/doubles.vitest)** - Mocking adapter for Vitest

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

