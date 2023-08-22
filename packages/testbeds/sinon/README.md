<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/omermorad/automock/master/logo.png" alt="Logo" />
</p>

<h1 align="center">Automock</h1>

<p align="center">
<strong>Automock simplifies the process of writing unit tests by automatically creating mock objects for class
dependencies, allowing you to focus on writing test cases instead of mock setup.</strong>
</p>

### :books: [Documentation](https://automock.dev/docs/introduction/intro/) | :book: [API Reference](https://automock.dev/api-reference/category/api-reference/)

Specially designed for Inversion of Control (IoC) and Dependency Injection (DI) scenarios, Automock seamlessly
integrates automatic mocking into various DI and testing frameworks. Automock's adaptability ensures a seamless and
effective testing experience, empowers you to isolate and test individual components with ease, enhancing the efficiency
and reliability of your unit testing journey.

## :package: Installation

To fully integrate Automock into your testing and dependency injection (DI) frameworks, **you'll need to install two
packages: `@automock/sinon`, and the corresponding DI framework adapter.**

Install the Sinon package
```bash
npm i -D @automock/sinon
````

And for your DI framework, install the appropriate Automock adapter:

|   DI Framework Adapter                                 |   Sinon (`@automock/sinon`)                   |
|--------------------------------------------------------|-----------------------------------------------|
|   NestJS Adapter (`@automock/adapters.nestjs`)         | :white_check_mark:                            |
|   Inversify Adapter (`@automock/adapters.inversify`)   | :white_check_mark: (Beta)                     |
|   Ts.ED Adapter (`@automock/adapters.tsed`)            | Soon                                          |
|   TypeDI Adapter (`@automock/adapters.typedi`)         | Soon                                          |

## :bulb: Quick Example

Take a look at the following example (using Jest, but the same applies for Sinon), Automock streamlines the test
creation process by automating the creation of mock objects and stubs, reducing boilerplate code and eliminating the
manual setup effort.

```typescript
class Database {
  getUsers(): Promise<User[]> { ... }
}

class UserService {
  constructor(private database: Database) {}

  async getAllUsers(): Promise<User[]> {
    return this.database.getUsers();
  }
}
```

```typescript
import { TestBed } from '@automock/sinon';
import { SinonStubbedInstance } from 'sinon';
import { expect } from 'chai';
import { before } from 'mocha';

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


In this example, Automock simplifies the creation of mock objects and stubs for the `Database` dependency. By utilizing
the `TestBed`, you can create an instance of the `UserService` class with automatically generated mock objects for its
dependencies.

During the test, you can directly access the automatically created mock object for the `Database` dependency (database).
By stubbing the `getUsers()` method of the database mock object, you can define its behavior and ensure it resolves with
a specific set of mock users.

## :scroll: License

Distributed under the MIT License. See `LICENSE` for more information.
