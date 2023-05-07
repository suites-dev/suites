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
    Standalone Library for Automated Mocking of Class Dependencies.
  </h3>

  <h4 align="center">
    Rapid and effortless creation of unit tests
    while ensuring complete isolation of class dependencies.
  </h4>
</p>

## What is Automock?
**Automock is a TypeScript-based library designed for unit testing applications.**

By leveraging the TypeScript Reflection API (`reflect-metadata`) under the hood,
Automock simplifies the process of writing tests by automatically generating mock
objects for a class's dependencies.

## Installation
To begin, you need to install a mocking library such as Sinon or Jest.
* Jest - `@automock/jest`
* Sinon - `@automock/sinon`

Next, proceed with the installation of the necessary plugin for your chosen framework.
The frameworks that are supported include NestJS, Ts.ED, and Inversify.

* NestJS - `@automock/nestjs`
* Inversify - `@automock/inversify`
* Ts.ED - `@automock/tsed`

Automock takes care of the remaining wiring.

For example, using Jest and NestJS:
```bash
npm install -D @automock/jest @automock/nestjs
```

## :thinking: Problem
Consider the following class and interface:

```typescript
interface Logger {
  log(msg: string, metadata: any): void;
  warn(msg: string, metadata: any): void;
  info(msg: string, metadata: any): void;
}

@Injectable()
class UsersService {
  constructor(private logger: Logger) {}
  
  generateUser(name: string, email: string): User {
    const userData: User = { name, email };
    this.logger.log('returning user data', { user: userData });
    return userData;
  }
}
```

A sample unit test for this class could resemble the following code snippet:

```typescript
describe('Users Service Unit Spec', () => {
  let usersService: UsersService; // Unit under test
  let loggerMock: jest.Mocked<Logger>;
  
  beforeAll(() => {
    loggerMock = { log: jest.fn() };
    usersService = new UsersService(loggerMock);
  });
  
  test('call logger log with generated user data', () => {
    usersService.generateUser('Joe', 'joe@due.com');
    expect(loggerMock.log).toBeCalled(); // Verify the call
  });
});
```

One of the primary challenges in writing unit tests is the requirement to initialize
each class dependency individually and generate a mock object for each of these dependencies.

<details><summary><b>Reveal Even Worse Example</b> 🤦</summary><p>

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

## :bulb: The Solution
```typescript
import { TestBed } from '@automock/jest';

describe('Users Service Unit Spec', () => {
  let unitUnderTest: UsersService;
  let logger: jest.Mocked<Logger>;

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(UsersService).compile();

    // The actual instance of the class
    unitUnderTest = unit;

    // The reference to logger mock object
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

As demonstrated by the code snippet above, the utilization of Automock enables one
to concentrate on testing the logic, rather than expending effort on the laborious
task of manually creating mock objects and stub functions. Additionally, there is
no need for concern regarding the potential for breaking the class type.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
