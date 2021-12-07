[![ISC license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/omermorad/automock/master.svg?style=flat-square)](https://codecov.io/gh/omermorad/automock)
[![ci](https://github.com/omermorad/automock/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/omermorad/automock/actions)
[![npm version](https://img.shields.io/npm/v/@automock/sinon?color=%23995f44&label=@automock/sinon&logo=automock%20Sinon)](https://npmjs.org/package/@automock/sinon "View this project on npm")
[![npm version](https://img.shields.io/npm/v/@automock/jest?color=%23aa709f&label=%40automock%2Fjest&logo=automock%20Jest)](https://npmjs.org/package/@automock/jest "View this project on npm")


<p align="center">
  <br/>
  <img width="200" src="https://raw.githubusercontent.com/omermorad/automock/master/logo.png" alt="Logo" />

  <h1 align="center">AutoMock</h1>

  <h3 align="center">
    Standalone Library for Dependencies Auto Mocking (for TypeScript)
  </h3>

  <h3 align="center">
    Works with any testing framework!
  </h3>

  <h4 align="center">
    Create unit test simply and easily with 100% isolation of class dependencies
  </h4>
</p>

## Installation
Install `@automock/cli`

```bash
npm i -g @automock/cli
```

run init simply by hitting

```bash
automock init
```

This will install the selected mocking library (Sinon/Jest), and let you choose the framework. \
Available frameworks: NestJS, TypeDI, Ts.ED, Angular

## Who can use this library? 🤩
**TL;DR**

If you are using this pattern in your framework (no matter which):

```typescript
export class AwesomeClass {
  public constructor(private readonly dependecy: SomeClassOrInterface) {}
}
```

AutoMock is for you!

### Tell me more 🤔
If you are using any TypeScript framework like Angular, React+TypeScript, NestJS, TypeDI, Ts.ED,
Vue+TypeScript, or even if you are framework free, AutoMock is for you.
AutoMock is framework agnostic, so everyone can enjoy it!

The only assumption we make is that you are taking your class dependencies,
(no matter if they are classes, functions or even interfaces) through the
class constructor.

## What is this library❓

This library helps isolate the dependencies of any given class, by using a simple
reflection mechanism on the class constructor params metadata.
Meaning all the class dependencies (constructor params) will be overridden
automatically and will become mocks.

## Example and Usage 💁‍

This specific example is for Jest, but don't worry, we got you covered with more examples
for every testing framework! [Jump to the recipes page](http://)

```typescript
import { MockOf, Spec } from '@automock/spec';

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

* [sinon](https://github.com/sinonjs/sinon)
* [jest](https://github.com/facebook/jest)
* [jest-mock-extended](https://github.com/marchaos/jest-mock-extended)
