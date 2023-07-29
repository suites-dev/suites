<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/omermorad/automock/master/logo.png" alt="Logo" />
</p>

<h1 align="center">Automock</h1>

<p align="center">
<strong>Automock simplifies the process of writing unit tests by automatically creating mock objects for class
dependencies, allowing you to focus on writing test cases instead of mock setup.</strong>
</p>

<br>

Specially designed for Inversion of Control (IoC) and Dependency Injection (DI) scenarios, Automock seamlessly
integrates automatic mocking into various DI and testing frameworks. Automock's adaptability ensures a seamless and
effective testing experience, empowers you to isolate and test individual components with ease, enhancing the efficiency
and reliability of your unit testing process.

## :package: Installation

```bash
npm i -D @automock/sinon
```

## :computer: Usage Example

Take a look at the following example (Combining Mocha and Chai):

```typescript
import { TestBed } from '@automock/sinon';
import { SinonStubbedInstance } from 'sinon';
import { expect } from 'chai';
import { before } from 'mocha';

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
  let database: SinonStubbedInstance<Database>;

  before(() => {
    const { unit, unitRef } = TestBed.create(UserService).compile();
    userService = unit;
    database = unitRef.get(Database);
  });

  it('should return users from the database', async () => {
    const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
    database.getUsers.resolves(mockUsers);

    const users = await userService.getAllUsers();

    expect(database.getUsers).to.be.calledOnce();
    expect(users).to.equal(mockUsers);
  });
});
```

**Both property injection and constructor injection are supported.** Whether your classes rely on dependencies injected
through properties or constructor parameters, Automock handles both scenarios seamlessly. This flexibility allows you to
write unit tests for a wide range of classes, ensuring that all dependencies are effectively mocked and isolated during
testing, regardless of the injection method used.

**[:books: For more examples and for API reference visit our docs page](https://github.com/automock/automock/blob/master/docs/automock.md)**

## :bookmark_tabs: Acknowledgments

Automock is built upon the fundamentals and principles of unit tests, particularly inspired by Martin Fowler's blog
posts on unit tests. Fowler advocates for creating "solitary" unit tests that concentrate on testing a single unit of
code in isolation, independently of its dependencies. This approach aligns with Automock's objective of providing a
simple and effective solution for automatically mocking class dependencies during unit testing.

If you're interested in learning more about unit tests, we encourage you to explore Martin Fowler's blog post on the
topic: https://martinfowler.com/bliki/UnitTest.html

## :scroll: License

Distributed under the MIT License. See `LICENSE` for more information.
