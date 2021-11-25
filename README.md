[![ISC license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![npm version](http://img.shields.io/npm/v/nestjs-jester.svg?style=flat)](https://npmjs.org/package/nestjs-jester "View this project on npm")
[![Codecov Coverage](https://img.shields.io/codecov/c/github/omermorad/nestjs-jester/master.svg?style=flat-square)](https://codecov.io/gh/omermorad/nestjs-jester)
[![ci](https://github.com/omermorad/nestjs-jester/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/omermorad/nestjs-testing/actions)

<p align="center">
  <img height="450" src="https://raw.githubusercontent.com/omermorad/nestjs-jester/master/logo.png" alt="Logo" />

  <h1 align="center">NestJS Jester 🤡</h1>

  <h3 align="center">
    Library for Writing Unit Tests Easily with Auto Mocking Capabilities
  </h3>

  <h4 align="center">
    Create unit test simply and easily with 100% isolation of class dependencies
  </h4>

  <h5 align="center">
    * This library is supporting Jest only
  </h5>
</p>

## Installation

💡 Install `jest-mock-extended` as a peer dependency

With NPM:
```bash
npm i -D nestjs-jester jest-mock-extended
```

Or with Yarn:
```bash
yarn add -D nestjs-jester jest-mock-extended
```

## Motivation 💪

Unit tests exercise very small parts of the application **in complete isolation**. \
**"Complete isolation" means that, when unit testing, you don’t typically
connect your application with external dependencies such as databases, the filesystem,
or HTTP services**. That allows unit tests to be fast and more stable since they won’t
fail due to problems with those external services. (Thank you, Testim.io - [jump to source](https://www.testim.io/blog/unit-testing-best-practices/))

This package helps isolate the dependencies of an `Injectable` class, by using a simple
reflection mechanism (with NestJS `Refelector`). When used in conjunction with
`jest-mock-extended` library, all the class (`Injectable`) dependencies will be overridden
automatically and become mocks (or deep mocks if you want it to).

## Example and Usage 💁‍

<details><summary><code>📄 Original Class</code></summary><p>

```typescript
@Injectable()
export class SomeService {
  public constructor(
    private readonly logger: Logger,
    private readonly catsService: CatsService,
    private readonly userService: UserService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}
  
  public async doSomethingNice() {
    if (this.featureFlagService.isFeatureOn()) {
      const users = await this.userService.getUsers('https://example.com/json.json');
      this.logger.log(users);

      return users;
    }
    
    return null;
  }
}
```
</p></details>

```typescript
import { DeepMockOf, MockOf, Spec } from 'nestjs-jester';

describe('SomeService Unit Test', () => {
  let someService: SomeService;
  let logger: MockOf<Logger>;
  let userService: MockOf<UserService>;

  const USERS_DATA = [{ name: 'user', email: 'user@user.com' }];

  beforeAll(() => {
    const { unit, unitRef } = Spec.createUnit<SomeService>(SomeService)
      .mock(FeatureFlagService)
      .using({
        isFeatureOn: () => Promise.resolve(true),
      })
      // All the rest of the dependencies will be mocked
      // Pass true if you want to deep mock all of the rest
      .compile();

    someService = unit;
    userService = unitRef.get(UserService);
  });

  describe('When something happens', () => {
    beforeAll(() => (userService.getUsers.mockResolvedValueOnce(USERS_DATA));
    
    test('then check something', async () => {
      const result = await service.doSomethingNice();

      expect(logger.log).toHaveBeenCalledWith(USERS_DATA);
      expect(result).toEqual(USERS_DATA);
    });
  });
});
```

**Still need further example? [Jump to full sample](https://github.com/omermorad/nestjs-jester/tree/master/sample) 📄**

## More about `jest-mock-extended` package 📦
`jest-mock-extended` is a library which enables type safe mocking for Jest with TypeScript.
It provides a complete Typescript type safety for interfaces, argument types and return types
and has the ability to mock any interface or object.

## License 📜

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements 📙

[jest-mock-extended](https://github.com/marchaos/jest-mock-extended)
