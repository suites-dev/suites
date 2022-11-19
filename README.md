[![ISC license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![npm version](http://img.shields.io/npm/v/@automock/jest.svg?style=flat)](https://npmjs.org/package/@automock/jest "View this project on npm")
[![npm downloads](https://img.shields.io/npm/dm/@automock/jest.svg)](https://npmjs.org/package/@automock/jest "View this project on npm")
[![Codecov Coverage](https://img.shields.io/codecov/c/github/omermorad/automock/master.svg?style=flat-square)](https://codecov.io/gh/omermorad/automock)
[![ci](https://github.com/omermorad/automock/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/omermorad/automock/actions)

<p align="center">
  <br/>
  <img width="200" src="https://raw.githubusercontent.com/omermorad/automock/master/logo.png" alt="Logo" />

  <h1 align="center">Automock</h1>

  <h3 align="center">
    Standalone Library for Class Dependencies Auto Mocking (TypeScript Based)
  </h3>

  <h4 align="center">
    Write solitary unit tests rapidly and easily, with total isolation
    of external class dependencies
  </h4>
</p>

## What is Automock?
Automock is a mocking library for unit testing TypeScript-based applications.
Using TypeScript Reflection API (`reflect-metadata`) internally to produce
mock objects, Automock streamlines test development by automatically mocking
external dependencies.

Class constructor injection is commonly used within frameworks that implement
the principles of dependency injection and inversion of control. Automock
could be extremely useful with these frameworks and integrates easily with
them.

**Some well-known supported frameworks are: NestJS, Ts.ED, TypeDI and Angular.**

## Installation
```bash
npm i -D @automock/jest
```

Jest is the only test framework currently supported by Automock.
Sinon will shortly be released.

## Prerequisites
* Automock can be used if the framework you're working with supports
dependency injection (or you either implementing it manually by yourself).

* The dependency injection engine makes use of class constructor injection.

<details><summary><strong>💡 More about IoC and DI</strong></summary><p>
Inversion of Control (IoC) and dependency injection (DI) are used interchangeably.
IoC is achieved through DI. DI is the process of providing dependencies and IoC is
the end result of DI. Usually, IoC containers enforces the DI pattern for different
components, and this leaves them loosely coupled and allows you to code to
abstractions.

Dependency injection is a style of object configuration in which an object's fields
and collaborators are set by an external entity. In other words, objects are
configured by an external entity. Dependency injection is an alternative to having
the object configure itself.
</p></details>

## 🤔 Problem(s)
Consider the following class and interface:

```typescript
interface Logger {
  log(msg: string, metadata: any): void;
  warn(msg: string, metadata: any): void;
  info(msg: string, metadata: any): void;
}

@Injectable() // Could be any decorator
class UsersService {
  constructor(private logger: Logger) {}
  
  generateUser(name: string, email: string): User {
    const userData: User = { name, email };
    this.logger.log('returning user data', { user: userData });
    return userData;
  }
}
```

An example of a unit test for this class may look something like this:

```typescript
describe('Users Service Unit Spec', () => {
  let usersService: UsersService; // Unit under test
  let loggerMock: jest.Mocked<Logger>;
  
  beforeAll(() => {
    loggerMock = { log: jest.fn() }; // ! TSC will emit an error
    usersService = new UsersService(loggerMock);
  });
  
  test('call logger log with generated user data', () => {
    usersService.generateUser('Joe', 'joe@due.com');
    expect(loggerMock.log).toBeCalled(); // Verify the call
  });
});
```

One of the main challenging aspects of writing unit tests is
the necessity to individually initialize all class dependencies
and create a mock object for each of these dependencies.

Implementing the `Logger` interface is mandatory when working with
the [`jest.Mocked` (read more)](https://jestjs.io/docs/mock-function-api#jestmockedsource).
In case the `Logger` interface is extended, TypeScript will enforce
that the corresponding `loggerMock` variable also implement all of those
methods, ending up with an object full of stubs

Another issue that arises when utilizing an IoC/DI in unit tests,
is that the dependencies resolved from the container (DI container),
are not mocked and instead yield actual instances of their classes.
Therefor, running into the same issue, which is manually constructing
mock objects and stub functions.

<details><summary><code>💡 Demonstration / Example</code></summary><p>

```typescript
describe('Users Service Unit Spec', () => {
  let usersService: UsersService;
  let loggerMock: jest.Mocked<Logger>;
  let apiServiceMock: jest.Mocked<ApiService>;

  beforeAll(() => {
    loggerMock = { log: jest.fn(), warn: jest.fn(), info: jest.fn() };
    apiServiceMock = { getUsers: jest.fn(), deleteUser: jest.fn() };
    usersService = new UsersService(loggerMock, apiServiceMock);
  });

  test('...', () => { ... });
});

```
</p></details>

## 💡 Solution with Automock
```typescript
import { TestBed } from '@automock/jest';

describe('Users Service Unit Spec', () => {
  let unitUnderTest: UsersService;
  let logger: jest.Mocked<Logger>;
  let apiService: jest.Mocked<UsersService>;

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(UsersService).compile();

    unitUnderTest = unit;
    apiService = unitRef.get(ApiService);
    logger = unitRef.get(Logger);
  });

  describe('when something happens', () => {
    test('then expect for something else to happen', async () => {
      await unitUnderTest.callSomeMethod();

      expect(logger.log).toHaveBeenCalled();
    });
  });
});
```

As seen in the preceding code sample, by using Automock, developers can focus
more on testing the logic and less on the tedious task of manually constructing
mock objects and stub functions. Furthermore, they don't need to worry about
breaking the class type.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📙 Acknowledgements

[jest-mock-extended](https://github.com/marchaos/jest-mock-extended)
