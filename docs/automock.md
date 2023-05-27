# Automock Examples and API Reference

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

## TestBed API

### `TestBed.create(classToTest)`

The `TestBed.create(classToTest)` method initializes the `TestBed` with the class you want to test. It takes the
classToTest parameter, which represents the class for which you want to create an instance.

Example usage:

```typescript
const { unit, unitRef } = TestBed.create(UserService);
```

### `.mock(dependency).using(implementation)`

The `.mock(dependency)` method is used to indicate that you want to set a default mock for a specific dependency of the
class under test. It takes the dependency parameter, which represents the class or module to be mocked.

The `.using(implementation)` method allows you to provide default values or behavior for the methods of the mocked
dependency. It takes the implementation parameter, which represents an object specifying the default values or behavior
for the mocked methods.

Let's change the previous example to demonstrate:

```typescript
describe('User Service Unit Spec', () => {
  let userService: UserService;
  let database: jest.Mocked<Database>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(UserService)
      .mock(UserService)
      .using({
        getAllUsers: async () => [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
      })
      .compile();

    userService = unit;
    database = unitRef.get(Database);
  });

  test('getAllUsers should retrieve users from the database', async () => {
    const users = await userService.getAllUsers();

    expect(database.getUsers).toHaveBeenCalled();
    expect(users).toEqual(mockUsers);
  });
});
```

During the test, the `getAllUsers` method of the `UserService` instance will be replaced with the provided
implementation, which retrieves a predefined array of mock users. The `Database` dependency, on the other hand, is
automatically mocked, allowing us to assert that its `getUsers` method is called.

This approach simplifies the testing process by allowing us to define custom behavior for specific methods of the class
under test. With the `TestBed` API, we can create focused tests that validate the behavior of individual methods without
being affected by the actual implementation of dependencies.

### `.compile()`

The `.compile()` method finalizes the TestBed setup and returns an object that contains the instance of the class under
test (`unit`) and a reference to the mocked dependencies (`unitRef`).

## :link: Dependency References and Instance Access

When utilizing `TestBed`, the `compile()` method returns an object with two important properties: `unit` and `unitRef`.
These properties provide access to the instance of the class under test and references to its dependencies,
respectively.

`unit` - The `unit` property represents the actual instance of the class under test. In our example, it corresponds to
an instance of the UserService class. This allows you to directly interact with the class and invoke its methods during
your test scenarios.

`unitRef` - The `unitRef` property serves as a reference to the dependencies of the class under test. In our example, it
refers to the Database dependency used by the `UserService`. By accessing `unitRef`, you can retrieve the automatically
generated mock object for the dependency. This enables you to stub methods, define behaviors, and assert method
invocations on the mock object.

Combining the the `unit` and `unitRef`, you have full control over the class under test and its dependencies within your
unit tests. You can manipulate the behavior of dependencies, assert method calls, and validate the expected outputs
seamlessly.

```typescript
const { unit, unitRef } = TestBed.create(UserService).compile();

// Access the instance of the class under test
const userService = unit;

// Access the mock object for the Database dependency
const databaseMock = unitRef.get(Database);
```
