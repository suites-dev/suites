[![ISC license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/omermorad/automock/master.svg?style=flat-square)](https://codecov.io/gh/omermorad/automock)

[![npm version](https://img.shields.io/npm/v/@automock/jest/latest?label=%40automock%2Fjest)](https://npmjs.org/package/@automock/jest "View this project on npm")
[![npm downloads](https://img.shields.io/npm/dm/@automock/jest.svg?label=%40automock%2Fjest)](https://npmjs.org/package/@automock/jest "View this project on npm")
[![npm version](https://img.shields.io/npm/v/@automock/sinon/latest?label=%40automock%2Fsinon)](https://npmjs.org/package/@automock/jest "View this project on npm")
[![npm downloads](https://img.shields.io/npm/dm/@automock/sinon.svg?label=%40automock%2Fsinon)](https://npmjs.org/package/@automock/sinon "View this project on npm")

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

Automock is a TypeScript library designed to streamline the process of writing unit tests. By automatically creating
mock objects for class constructor dependencies and stubbing methods, Automock simplifies the setup of test
environments, enabling developers to focus on writing test cases without the hassle of manually creating mocks.

## :package: Installation

Automock provides a convenient CLI to ease the installation and setup process. By running one command, you can
initialize your project, choosing your preferred testing framework and dependency injection (DI)
framework.

```bash
npx automock init
```

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
  getUsers(): Promise<User[]> {
    // Database retrieval logic
  }
}

class UserService {
  constructor(private database: Database) {
  }

  async getAllUsers(): Promise<User[]> {
    return this.database.getUsers();
  }
}

describe('UserService', () => {
  let userService: UserService;
  let database: jest.Mocked<Database>;

  beforeEach(() => {
    const { unit } = TestBed.create(UserService).compile();
    userService = unit;
    database = unit.get(Database);
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
the TestBed, you can create an instance of the `UserService` class with automatically generated mock objects for its
dependencies. The `compile()` method compiles the test bed and returns an instance of the class under test (userService)
.

During the test, you can directly access the automatically created mock object for the `Database` dependency (database).
By stubbing the `getUsers()` method of the database mock object, you can define its behavior and ensure it resolves with
a specific set of mock users.

Automock streamlines the test creation process by automating the creation of mock objects and stubs, reducing
boilerplate code and eliminating the manual setup effort. This allows you to focus on writing meaningful test cases and
validating the behavior of your code without getting bogged down in repetitive mock object creation.

## Dependency References and Instance Access

When utilizing TestBed, the `compile()` method returns an object with two important properties: `unit` and `unitRef`.
These properties provide access to the instance of the class under test and references to its dependencies,
respectively.

`unit` - The unit property represents the actual instance of the class under test. In our example, it corresponds to an
instance of the UserService class. This allows you to directly interact with the class and invoke its methods during
your test scenarios.

`unitRef` - The unitRef property serves as a reference to the dependencies of the class under test. In our example, it
refers to the Database dependency used by the UserService. By accessing unitRef, you can retrieve the automatically
generated mock object for the dependency. This enables you to stub methods, define behaviors, and assert method
invocations on the mock object.

Combining the power of `unit` and `unitRef`, you have full control over the class under test and its dependencies within
your unit tests. You can manipulate the behavior of dependencies, assert method calls, and validate the expected outputs
seamlessly.

```typescript
const { unit, unitRef } = TestBed.create(UserService).compile();

// Access the instance of the class under test
const userService = unit;

// Access the mock object for the Database dependency
const databaseMock = unitRef.get(Database);
```

## :bulb: Philosophy

We think that creating high-quality unit tests ought to be a breeze. We created Automock to remove the human element
from the otherwise tedious and error-prone process of creating mock objects for dependencies. The following tenets form
the basis of our philosophy:

* **Productivity.** Automock aims to save developers valuable time and effort by automating the process of creating mock
  objects. It eliminates the need for manual mock setup and reduces boilerplate code, enabling you to focus on writing
  meaningful test cases and improving code quality.


* **Simplicity**. The library provides an intuitive and easy-to-use API, making it accessible to developers of all skill
  levels. By automating mock object creation, Automock simplifies the testing process, reducing complexity and making
  unit testing more approachable.


* **Maintainability.** By generating mock objects that closely resemble the original dependencies, Automock promotes
  code maintainability. The generated mocks retain the same type information as the real objects, ensuring type safety
  and allowing you to leverage TypeScript's powerful static type checking capabilities. This approach enhances code
  readability, reduces the risk of errors, and makes it easier to refactor and maintain tests over time.


* **Flexibility.** Automock is designed to be flexible and adaptable to different testing scenarios. It provides
  built-in support for popular testing frameworks such as Sinon and Jest, allowing you to seamlessly integrate it into
  your existing testing infrastructure. Additionally, Automock supports various Dependency Injection (DI) frameworks,
  enabling you to work with your preferred DI solution while still leveraging its automatic mocking capabilities.

## :gear: Jest and Sinon Compatibility

Automock is designed to be compatible with popular testing frameworks such as Jest and Sinon, providing flexibility and
support for different testing setups. Whether you prefer Jest or Sinon for your unit tests, Automock seamlessly
integrates with both, allowing you to leverage its powerful mocking capabilities.

## :rocket: Improving Continuous Integration (CI)

Automock can greatly enhance your CI pipeline. Since Automock automatically mocks all class dependencies, you can
confidently assume that your unit tests are executed in complete isolation, creating a solitary unit testing
environment.

We recommend naming your test files with a specific suffix, such as `*.spec.ts` or `*.unit.ts`. This convention allows
you to easily distinguish and run your unit tests separately.

This solitary unit testing environment provides numerous benefits for optimizing your CI process:

* **Isolation**: With Automock seamlessly handling mock creation, your unit tests are shielded from external
  dependencies. This ensures that tests execute independently, without interference or unwanted side effects. The result
  is consistent and reliable test outcomes.


* **Speed**: By removing the need to interact with external systems, Automock significantly speeds up your unit tests.
  Freed from potential delays or bottlenecks caused by dependencies, tests can focus solely on the code being tested.
  This translates to shorter CI build times, faster feedback loops, and increased developer productivity.


* **Stability**: Automock's isolation mitigates the impact of changes in external systems. Your unit tests become more
  stable, as failures caused by issues in external services or APIs are eliminated. Your CI pipeline remains robust and
  dependable.


* **Parallelization**: The solitary unit testing environment created by Automock enables parallel execution of unit
  tests. Each test is self-contained and isolated, allowing multiple tests to run concurrently without conflicts or
  dependencies. This parallelization further boosts CI build speed and scalability.


* **Consistency**: Automock guarantees consistent test results by providing a controlled environment. The automatic
  generation of mock objects ensures that the same set of mocks and stubs are utilized across test runs. This
  consistency is essential for reliable issue identification and reproduction. To run your unit tests separately, you
  can configure your CI pipeline to include a dedicated step that runs only the files with the specified suffix (
  e.g., `*.spec.ts`).

## :point_up_2: Acknowledgments

Automock is deeply influenced by the principles and concepts discussed in Martin Fowler's blog post on "Solitary Unit
Tests".

In his blog post, he discusses the idea of creating "solitary" unit tests, which focus on testing a single unit of code
in isolation, independent of its dependencies. This approach promotes test independence, enhances test reliability, and
simplifies test maintenance.

We are grateful to Martin Fowler for his valuable insights and contributions to the software development community. His
work has greatly influenced the development of Automock.

To learn more about the theory of solitary unit tests, we encourage you to read Martin Fowler's blog
post: https://martinfowler.com/bliki/UnitTest.html

## :scroll: License

Distributed under the MIT License. See `LICENSE` for more information.
