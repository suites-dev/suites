[![ISC license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![npm version](http://img.shields.io/npm/v/nestjs-jester.svg?style=flat)](https://npmjs.org/package/nestjs-jester "View this project on npm")
[![Codecov Coverage](https://img.shields.io/codecov/c/github/omermorad/nestjs-jester/master.svg?style=flat-square)](https://codecov.io/gh/omermorad/nestjs-testing)
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

Unit tests exercise very small parts of the application **in complete isolation**.
**"Complete isolation" means that, when unit testing, you don’t typically
connect your application with external dependencies such as databases, the filesystem,
or HTTP services**. That allows unit tests to be fast and more stable since they won’t
fail due to problems with those external services. (Thank you, Testim.io - [jump to source](https://www.testim.io/blog/unit-testing-best-practices/))

This package will help you isolate the dependencies of an `Injectable` class, by using a simple
reflection mechanism (using NestJS `Refelector`). When used in conjunction with the library
called `jest-mock-extended`, all the class dependencies will be overridden automatically and
become mocks (or deep mocks if you want it to).

## Example and Usage 💁‍

<details><summary><code>📄 Original Class</code></summary><p>

```typescript
@Injectable()
export class SomeService {
  public constructor(
    private readonly logger: Logger,
    private readonly catsService: CatsService,
    private readonly httpService: HttpService
  ) {}
  
  public async doSomethingNice() {
    const { data } = await this.httpService.get<{ users: any }>('https://example.com/json.json');
    this.logger.log(data);
    
    return data.users;
  }
}
```
</p></details>

```typescript
import { DeepMockOf, MockOf, Spec } from 'nestjs-jester';

describe('Some Unit Test', () => {
  let someService: SomeService;
  let logger: MockOf<Logger>;
  let httpService: MockOf<HttpService>;

  const errorMock = new Error('Some Error');

  beforeAll(() => {
    const { unit, unitRef } = Spec.createUnit<SomeService>(SomeService)
      .mock(logger)
      .using({
        log: (msg) => console.log(msg),
      })
      .deepMock(HttpService)
      .using({
        get: async () => Promise.resolve({ something: [] }),
      })
      // All the rest of the dependencies will be mocked
      // Pass true if you want to deep mock all of the rest
      .compile(); 

    someService = unit;

    dependecy = unitRef.get(SomeService);
  });

  describe('when something happens', () => {
    test('then check something', async () => {
      service.doSomethingNice();

      payoutService.performActionForTest();

      expect(logger.log).toHaveBeenCalled();
      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });
  });
});
```

## More about `jest-mock-extended` package 📦
`jest-mock-extended` is a library which enables type safe mocking for Jest with TypeScript.
It provides a complete Typescript type safety for interfaces, argument types and return types
and has the ability to mock any interface or object.

## License 📜

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements 📙

[jest-mock-extended](https://github.com/marchaos/jest-mock-extended)
