<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/omermorad/automock/master/logo.png" alt="Logo" />
</p>

<h1 align="center">Automock (Sinon)</h1>

<p align="center">
<strong>Automock simplifies the process of writing unit tests by automatically creating mock objects for class
dependencies, allowing you to focus on writing test cases instead of mock setup.</strong>
</p>

<br>

Automock specially designed for Inversion of Control (IoC) and Dependency Injection (DI) scenarios, seamlessly
integrating automatic mocking into your framework of choice. With Automock, you can effortlessly isolate and test
individual components, improving the efficiency and reliability of your unit testing process.

## :package: Installation

```bash
npm i -D @automock/sinon
```

## :computer: Usage Example

With Automock, you can streamline the test creation process and eliminate the need for manual mock setup. Take a look at
the following example:

```typescript
import { TestBed } from '@automock/sinon';
import { SinonStubbedInstance } from 'sinon';

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

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(UserService).compile();
    userService = unit;
    database = unitRef.get(Database);
  });

  test('getAllUsers should retrieve users from the database', async () => {
    const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
    database.getUsers.resolves(mockUsers);

    const users = await userService.getAllUsers();

    expect(database.getUsers).to.be.calledOnce();
    expect(users).to.be(mockUsers);
  });
});
```

Automock streamlines the test creation process by automating the creation of mock objects and stubs, reducing
boilerplate code and eliminating the manual setup effort. This allows you to focus on writing meaningful test cases and
validating the behavior of your code without getting bogged down in repetitive mock object creation.

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

Automock is influenced by the principles and concepts discussed in Martin Fowler's blog post on "Unit Tests". He
discusses the idea of creating "solitary" unit tests, which focus on testing a single unit of code in isolation,
independent of its dependencies.

To learn more about unit tests, we encourage you to read Martin Fowler's blog post:
https://martinfowler.com/bliki/UnitTest.html

## :scroll: License

Distributed under the MIT License. See `LICENSE` for more information.
