[![ISC license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/omermorad/aromajs/master.svg?style=flat-square)](https://codecov.io/gh/omermorad/aromajs)
[![ci](https://github.com/omermorad/aromajs/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/omermorad/aromajs/actions)
[![npm version](https://img.shields.io/npm/v/@aromajs/jest?color=%23aa709f&label=%40aromajs%2Fjest&logo=AromaJS%20Jest)](https://npmjs.org/package/@aromajs/jest "View this project on npm")

<p align="center">
  <h1 align="center">AromaJS ☕ Jest</h1>

  <h3 align="center">
    Standalone Library for Auto Mocking Your Dependencies while Unit Testing (for TypeScript)
  </h3>

  <h4 align="center">
    Create unit test simply and easily with 100% isolation of class dependencies
  </h4>
</p>

## Installation
```bash
npm i -D @automock/jest
```

## Who can use this library? 🤩
**TL;DR**

If you are using this pattern in your framework (it doesn't matter which one):

```typescript
export class AwesomeClass {
  public constructor(private readonly dependecy: SomeClassOrInterface) {}
}
```

AromaJS is exactly for you!

### Tell me more 🤔
If you are using any TypeScript framework: Angular, React+TypeScript, NestJS, TypeDI, Ts.ED
or even if you are framework free, AromaJS is for you. AromaJS is framework agnostic,
so it's basically serves everyone!

The only assumption/requirement is that you are taking your class dependencies,
(no matter if they are classes, functions or even interfaces) via
your class constructor.

## What is this library❓

This library helps isolate the dependencies of any given class, by using a simple
reflection mechanism on the class constructor params metadata.
Meaning all the class dependencies (constructor params) will be overridden
automatically and become mocks.

## Example and Usage 💁‍

This specific example is for Jest, but don't worry, we got you covered with examples
for every testing framework! [Jump to the recipes page](http://)

```typescript
import { MockOf, Spec } from '@automock/jest';

describe('SomeService Unit Test', () => {
  let testedService: SomeService;
  let logger: MockOf<Logger>;

  beforeAll(() => {
    const { unit, unitRef } = Spec
      .createUnit<SomeService>(SomeService)
      .compile();

    testedService = unit;
    logger = unitRef.get(Logger);
  });

  describe('When something happens', () => {
    beforeAll(() => (testedService.doSomething()));

    test('then call logger log', async () => {
      expect(logger.log).toHaveBeenCalled();
    });
  });
});
```

## Motivation 💪

Unit tests exercise very small parts of the application **in complete isolation**. \
**"Complete isolation" means that, when unit testing, you don’t typically
connect your application with external dependencies such as databases, the filesystem,
or HTTP services**. That allows unit tests to be fast and more stable since they won’t
fail due to problems with those external services. (Thank you, Testim.io - [jump to source](https://www.testim.io/blog/unit-testing-best-practices/))

## License 📜

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements 📙

* [Jest](https://github.com/facebook/jest)
* [jest-mock-extended](https://github.com/marchaos/jest-mock-extended)
