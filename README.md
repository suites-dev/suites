[![ISC license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![npm version](http://img.shields.io/npm/v/@automock/jest.svg?style=flat)](https://npmjs.org/package/automock "View this project on npm")
[![Codecov Coverage](https://img.shields.io/codecov/c/github/omermorad/automock/master.svg?style=flat-square)](https://codecov.io/gh/omermorad/automock)
[![ci](https://github.com/omermorad/automock/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/omermorad/automock/actions)

<p align="center">
  <br/>
  <img width="200" src="https://raw.githubusercontent.com/omermorad/automock/master/logo.png" alt="Logo" />

  <h1 align="center">AutoMock</h1>

  <h3 align="center">
    Standalone Library for Dependencies Auto Mocking/Stubbing (for TypeScript)
  </h3>

  <h4 align="center">
    Create solitary unit tests easily, with total isolation of other class dependencies
  </h4>
</p>

## Installation
**Note: sinon is coming soon**

With NPM:
```bash
npm i -D @automock/jest
```

Or with Yarn:
```bash
yarn add -D @automock/jest
```

## Who can use this library? 🤩
**TL;DR**

If you use any kind of framework that supports dependency inversion (with any DI engine)
like in the following example:
```typescript
export class AwesomeClass {
  public constructor(private readonly logger: Logger) {}
}
```

You can use AutoMock.

## Tell Me More 🤔
Unit testing is actually significant part of our code, and unit tests need to
be written quickly and rapidly. Unit tests should be written with complete isolation,
which means all the external (injected) dependencies should be mocked (actually, stubbed).

AutoMock does that for you; using simple reflection (which requires a decorator on the class)
AutoMock will replace the dependencies with mocks (in this case, `jest.fn()`), which can also
take implementation, see the example in the next section.

## Example and Usage 💁‍

```typescript
import { MockOf, Spec } from '@automock/jest';

describe('SomeService Unit Test', () => {
  let someService: MainService;

  let logger: MockOf<Logger>;
  let userService: MockOf<UserService>;

  const USERS_DATA = [{ name: 'user', email: 'user@user.com' }];

  beforeAll(() => {
    const { unit, unitRef } = Spec.createUnit(MainService)
      .mock(FeatureFlagService)
      .using({ isFeatureOn: () => Promise.resolve(true) })
      .compile();

    someService = unit;
    userService = unitRef.get(UserService);
  });

  describe('When something happens', () => {
    beforeAll(() => (userService.getUsers.mockResolvedValueOnce(USERS_DATA));
    
    test('then check something', async () => {
      await service.doSomethingNice();
      expect(logger.log).toHaveBeenCalledWith(USERS_DATA);
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

**Still need further example? [Jump to full sample](https://github.com/omermorad/automock/tree/master/sample) 📄**

## License 📜

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements 📙

[jest-mock-extended](https://github.com/marchaos/jest-mock-extended)
