[![ISC license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/automock/automock/master.svg?style=flat-square)](https://codecov.io/gh/automock/automock)
[![npm version](https://img.shields.io/npm/v/@automock/jest/latest?label=%40automock%2Fjest)](https://npmjs.org/package/@automock/jest "View this project on npm")
[![npm downloads](https://img.shields.io/npm/dm/@automock/jest.svg?label=%40automock%2Fjest)](https://npmjs.org/package/@automock/jest "View this project on npm")

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

**Automock simplifies the process of writing unit tests by automatically creating mock objects for class dependencies,
allowing developers to focus on writing test cases instead of manual mock setup.** It is specially designed for Inversion
of Control (IoC) and Dependency Injection (DI) scenarios, seamlessly integrating automatic mocking into your framework
of choice. With Automock, you can effortlessly isolate and test individual components, improving the efficiency and
reliability of your unit testing process.

## :package: Installation

```bash
npm i -D @automock/jest
```

> 👷 Coming Soon: Sinon Support! We are currently working on adding Sinon support, allowing you to leverage its mocking capabilities.

## :computer: Usage Example

Consider a simple example where you have a `UserService` class that relies on a `Database` service for data retrieval.
Traditionally, when writing unit tests for `UserService`, you would need to manually create mock objects for the
`Database` dependency and stub out its methods. This manual setup can be time-consuming and error-prone, leading to
repetitive code and increased maintenance overhead.

With Automock, you can streamline the test creation process and eliminate the need for manual mock setup. Take a look at
the following example:

```typescript
import { TestBed } from '@automock/jest';

class Database {
  getUsers(): Promise<User[]> { ...
  }
}

class UserService {
  constructor(private database: Database) {
  }

  async getAllUsers(): Promise<User[]> {
    return this.database.getUsers();
  }
}

describe('User Service Unit Spec', () => {
  let userService: UserService;
  let database: jest.Mocked<Database>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(UserService).compile();
    userService = unit;
    database = unitRef.get(Database);
  });

  test('getAllUsers should retrieve users from the database', async () => {
    const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
    database.getUsers.mockResolvedValue(mockUsers);

    const users = await userService.getAllUsers();

    expect(database.getUsers).toHaveBeenCalled();
    expect(users).toEqual(mockUsers);
  });
});
```

In this example, Automock simplifies the creation of mock objects and stubs for the `Database` dependency. By utilizing
the `TestBed`, you can create an instance of the `UserService` class with automatically generated mock objects for its
dependencies. The `compile()` method compiles the test bed and returns an instance of the class under test (userService)
.

During the test, you can directly access the automatically created mock object for the `Database` dependency (database).
By stubbing the `getUsers()` method of the database mock object, you can define its behavior and ensure it resolves with
a specific set of mock users.

Automock streamlines the test creation process by automating the creation of mock objects and stubs, reducing
boilerplate code and eliminating the manual setup effort. This allows you to focus on writing meaningful test cases and
validating the behavior of your code without getting bogged down in repetitive mock object creation.

**[For more examples and API reference visit the full documentation page](https://github.com/automock/automock/blob/master/docs/automock.md)**

## :bulb: Philosophy

We think that creating high-quality unit tests ought to be a breeze. We created Automock to remove the human element
from the otherwise tedious and error-prone process of creating mock objects manually. The following concepts serve
as the cornerstones of our philosophical framework:

* ✨ **Productivity.** Automock aims to save developers valuable time and effort by automating the process of creating
  mock objects. It eliminates the need for manual mock setup and reduces boilerplate code, enabling you to focus on
  writing meaningful test cases and improving code quality.


* :rocket: **Simplicity**. The library provides an intuitive and easy-to-use API, making it accessible to developers of
  all skill levels. By automating mock object creation, Automock simplifies the testing process, reducing complexity and
  making unit testing more approachable.


* 🔧 **Maintainability.** The generated mocks retain the same type information as the real objects, ensuring type safety
  and allowing you to leverage TypeScript's powerful static type checking capabilities. This approach enhances code
  readability, reduces the risk of errors, and makes it easier to refactor and maintain tests over time.


* 📐 **Consistent Syntax and Test Structure.** Automock promotes a uniform test syntax and test structure, ensuring
  consistency and coherence across your unit tests. By adhering to established conventions and guidelines, you can
  establish a standardized approach to writing tests.

## :rocket: Improving Continuous Integration (CI)

Automock can greatly enhance your CI pipeline. Since it automatically mocks all class dependencies, you can confidently
assume that your unit tests are executed in complete isolation, creating a solitary unit testing environment.

We recommend naming your test files with a specific suffix, such as `*.spec.ts` or `*.unit.ts`. This convention allows
you to easily distinguish and run your unit tests separately. [Read more about the Jest projects](https://jestjs.io/docs/configuration#projects-arraystring--projectconfig)

This solitary unit testing environment provides numerous benefits for optimizing your CI process:

* **Isolation**: With seamlessly handling mock creation, your unit tests are shielded from external dependencies. This
  ensures that tests execute independently, without interference or unwanted side effects. The result is consistent and
  reliable test outcomes.


* **Speed**: By removing the need to interact with external systems, Automock significantly speeds up your unit tests.
  Freed from potential delays or bottlenecks caused by dependencies, tests can focus solely on the code being tested.
  This translates to shorter CI build times, faster feedback loops, and increased developer productivity.


* **Stability**: Automock's isolation mitigates the impact of changes in external systems. Your unit tests become more
  stable, as failures caused by issues in external services or APIs are eliminated. Your CI pipeline remains robust and
  dependable.


* **Parallelization**: The solitary unit testing environment enables parallel execution of unit tests. Each test is
  self-contained and isolated, allowing multiple tests to run concurrently without conflicts or dependencies. This
  parallelization further boosts CI build speed and scalability.

## :bookmark_tabs: Acknowledgments

Automock is influenced by the principles and concepts discussed in Martin Fowler's blog post on "Unit Tests". He
discusses the idea of creating "solitary" unit tests, which focus on testing a single unit of code in isolation,
independent of its dependencies.

To learn more about unit tests, we encourage you to read Martin Fowler's blog post:
https://martinfowler.com/bliki/UnitTest.html

## :scroll: License

Distributed under the MIT License. See `LICENSE` for more information.
