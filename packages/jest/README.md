[![ISC license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/omermorad/aromajs/master.svg?style=flat-square)](https://codecov.io/gh/omermorad/aromajs)
[![ci](https://github.com/omermorad/aromajs/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/omermorad/aromajs/actions)
[![npm version](https://img.shields.io/npm/v/@aromajs/jest?color=%23aa709f&label=%40aromajs%2Fjest&logo=AromaJS%20Jest)](https://npmjs.org/package/@aromajs/jest "View this project on npm")

<p align="center">
  <h1 align="center">AromaJS ☕ Jest</h1>

  <h3 align="center">
    Standalone Library for Writing Unit Tests Easily with Auto Mocking Capabilities for TypeScript
  </h3>

  <h4 align="center">
    Create unit test simply and easily with 100% isolation of class dependencies
  </h4>
</p>

## Installation
```bash
npm i -D @aromajs/jest
```

## Who can use this library? 🤩
**TL;DR**

If you are using this pattern in your framework (it doesn't matter which one):

```typescript
export class AwesomeClass {
  public constructor(private readonly dependecy1: SomeOtherClass) {}
}
```

AromaJS is exactly for you!

### Tell me more 🤔
If you are using any TypeScript framework: Angular, React+TypeScript, NestJS, TypeDI, Ts.ED
or even if you are framework free, AromaJS is for you.

AromaJS is framework agnostic, so it's basically serves everyone!

The only assumption/requirement is that you are taking your class dependencies via
your class constructor (like in the example above).

## What is this library❓

This library helps isolate the dependencies of any given class, by using a simple
reflection mechanism on the class constructor params metadata.
Meaning all the class dependencies (constructor params) will be overridden
automatically and become mocks.

## Example and Usage 💁‍

This specific example is for Jest, but don't worry, we got you covered with examples
for every testing framework! [Jump to the recipes page](http://)

```typescript
import { DeepMockOf, MockOf, Spec } from '@aromajs/jest';

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

<details><summary><code>📄 Show me the source</code></summary><p>

```typescript
@Reflectable()
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

<hr />

<details>
    <summary>What is this <code>@Reflectable()</code> decorator?</summary>
    <p>
In order to reflect the constructor class params it needs to be decorated with any
class decorator, no matter what its original functionality.
If you are not using any kind of decorator, you can just use the default decorator that
does, literally, nothing; his purpose is to emit class metadata; so no w

But, for example, if you do use `@Injecatable()` (NestJS or Angular), `@Service()` (TypeDI),
`@Component()` or any kind of decorator, you don't need to decorate your class with
the `@Reflectable()` decorator.

</p>
</details>

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
