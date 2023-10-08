[![npm version](https://img.shields.io/npm/v/@automock/jest/latest?label=%40automock%2Fjest)](https://npmjs.org/package/@automock/jest "View this project on npm")
[![npm downloads](https://img.shields.io/npm/dm/@automock/jest.svg?label=%40automock%2Fjest)](https://npmjs.org/package/@automock/jest "View this project on npm")
[![npm version](https://img.shields.io/npm/v/@automock/sinon/latest?label=%40automock%2Fsinon)](https://npmjs.org/package/@automock/sinon "View this project on npm")
[![npm downloads](https://img.shields.io/npm/dm/@automock/sinon.svg?label=%40automock%2Fsinon)](https://npmjs.org/package/@automock/sinon "View this project on npm")

[![Codecov Coverage](https://img.shields.io/codecov/c/github/automock/automock/master.svg?style=flat-square)](https://codecov.io/gh/automock/automock)
[![ci](https://github.com/omermorad/jest-unit/actions/workflows/set-coverage.yml/badge.svg?branch=master)](https://github.com/automock/automock/actions)
[![e2e](https://github.com/omermorad/jest-unit/actions/workflows/e2e.yml/badge.svg?branch=master)](https://github.com/automock/automock/actions)




<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/omermorad/automock/master/logo.png" alt="Logo" />
</p>

<h1 align="center">Automock</h1>

<p align="center">
<strong>Automock simplifies the process of writing unit tests by automatically creating mock objects for<br>class dependencies,
allowing you to focus on writing test cases instead of mock setup.</strong>
</p>

Specially designed for Inversion of Control (IoC) and Dependency Injection (DI) scenarios, Automock seamlessly
integrates automatic mocking into various DI and testing frameworks. Automock's adaptability ensures a seamless and
effective testing experience, empowers you to isolate and test individual components with ease, enhancing the efficiency
and reliability of your unit testing process.

## :package: Installation

**Automock offers seamless integration both for Jest and Sinon.** Regardless of the
chosen testing framework, it provides the same API, maintaining a consistent and unified experience for users across
different environments.

```bash
npm i -D @automock/jest
```

```bash
npm i -D @automock/sinon
```

No further configuration is required.

## :computer: Usage Example

Take a look at the following example (using Jest, but the same applies for Sinon):

```typescript
import { TestBed } from '@automock/jest';

class Database {
  getUsers(): Promise<User[]> { ... }
}

class UserService {
  constructor(private database: Database) {}

  async getAllUsers(): Promise<User[]> {
    return this.database.getUsers();
  }
}

describe('User Service Unit Spec', () => {
  let userService: UserService;
  let database: jest.Mocked<Database>;

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(UserService).compile();
    userService = unit;
    database = unitRef.get(Database);
  });

  test('should return users from the database', async () => {
    const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
    database.getUsers.mockResolvedValue(mockUsers);

    const users = await userService.getAllUsers();

    expect(database.getUsers).toHaveBeenCalled();
    expect(users).toEqual(mockUsers);
  });
});
```

**Both property injection and constructor injection are supported.** Whether your classes rely on dependencies injected
through properties or constructor parameters, Automock handles both scenarios seamlessly. This flexibility allows you to
write unit tests for a wide range of classes, ensuring that all dependencies are effectively mocked and isolated during
testing, regardless of the injection method used.

**[:books: For more examples and for API reference visit our docs page](https://github.com/automock/automock/blob/master/docs/automock.md)**

## :bulb: Philosophy

**We think that creating high-quality unit tests ought to be a breeze. We created Automock to remove the human element
from the otherwise tedious and error-prone process of creating mock objects manually. The following tenets form the
basis of our philosophy:**

✨ **Productivity** \
Automock aims to save developers valuable time and effort by automating the process of creating mock objects. It
eliminates the need for manual mock setup and reduces boilerplate code, enabling you to focus on writing meaningful test
cases and improving code quality.

:rocket: **Simplicity** \
The library provides an intuitive and easy-to-use API, making it accessible to developers of all skill levels. By
automating mock object creation, Automock simplifies the testing process, reducing complexity and making unit testing
more approachable.

🔧 **Maintainability** \
By generating mock objects that closely resemble the original dependencies, Automock promotes code maintainability. The
generated mocks retain the same type information as the real objects, ensuring type safety and allowing you to leverage
TypeScript's powerful static type checking capabilities. This approach enhances code readability, reduces the risk of
errors, and makes it easier to refactor and maintain tests over time.

📐 **Consistent Syntax and Test Structure.** \
Automock promotes a uniform test syntax and test structure, ensuring consistency and coherence across your unit tests.
By adhering to established conventions and guidelines, you can establish a standardized approach to writing tests.

## :bookmark_tabs: Acknowledgments

Automock is built upon the fundamentals and principles of unit tests, particularly inspired by Martin Fowler's blog
posts on unit tests. Fowler advocates for creating "solitary" unit tests that concentrate on testing a single unit of
code in isolation, independently of its dependencies. This approach aligns with Automock's objective of providing a
simple and effective solution for automatically mocking class dependencies during unit testing.

If you're interested in learning more about unit tests, we encourage you to explore Martin Fowler's blog post on the
topic: https://martinfowler.com/bliki/UnitTest.html

## :scroll: License

Distributed under the MIT License. See `LICENSE` for more information.
