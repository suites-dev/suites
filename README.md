[![ISC license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![npm version](http://img.shields.io/npm/v/@nestjs-testing/jest.svg?style=flat)](https://npmjs.org/package/@nestjs-testing/jest "View this project on npm")
[![Codecov Coverage](https://img.shields.io/codecov/c/github/omermorad/nestjs-testing/master.svg?style=flat-square)](https://codecov.io/gh/omermorad/nestjs-testing)
[![ci](https://github.com/omermorad/nestjs-testing/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/omermorad/nestjs-testing/actions)

<p align="center">
  <img width="450" src="https://raw.githubusercontent.com/omermorad/nestjs-testing/master/logo.jpg" alt="Logo" />

  <h1 align="center">NestJS Testing Jest</h1>

  <h3 align="center">
    Library for Writing Unit Tests Easily with Auto Mocking Capabilities
  </h3>

  <h4 align="center">
    Create unit test simply and easily with 100% isolation of class dependencies
  </h4>
</p>

## Installation

💡 Install `jest-mock-extended` as a peer dependency

With NPM:
```bash
npm i -D @nestjs-testing/jest jest-mock-extended
```

Or with Yarn:
```bash
yarn add -D @nestjs-testing/jest jest-mock-extended
```

## Motivation
A lot of times you find yourself “preparing” some dummy data for your tests that
has to make sense for a specific test case(s) and is manipulated often.
Some developers are preparing JSON files, others create a long verbose object in
the test file itself, but the outcome always contains some fake data inside
(or even a snapshot from an external API).

## Example and Usage

```typescript
import { DeepMock, Spec } from '@nestjs-testing/jest';

describe('Some Unit Test', () => {
  let someService: SomeService;

  const errorMock = new Error('Some Error');

  beforeAll(() => {
    const { unit, unitRef } = Spec.createUnit<SomeService>(SomeService)
      .mock(PayoutDao)
      .using({
        createPayout: () => Promise.resolve({ id: 2 }),
      })
      .mock(ClientService)
      .using({
        getAccountId: () => Promise.resolve({ token: '' }),
      })
      .compile();

    someService = unit;

    dependecy = unitRef.get(SomeService);
  });

  describe('when something happens', () => {
    test('then check something', async () => {
      service.createTransfer.mockImplementationOnce(() => {
        throw errorMock;
      });

      payoutService.performActionForTest();

      expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });
  });
});
```

### More about `jest-mock-extended` package
`jest-mock-extended` is a library which enables type safe mocking for Jest with TypeScript.
It provides a complete Typescript type safety for interfaces, argument types and return types
and has the ability to mock any interface or object.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements

[jest-mock-extended](https://github.com/marak/Faker.js)
