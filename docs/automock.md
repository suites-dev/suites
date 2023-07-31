# Automock API Reference

## Table of Contents

- [Usage Example](#usage-example)
- [TestBed API](#testbed-api)
- [TestBedBuilder API](#testbedbuilder-api)
- [MockOverride API](#mockoverride-api)
- [Dependency References and Instance Access](#dependency-references-and-instance-access)

## Usage Example

Consider a simple example where you have a `UserService` class that relies on a `Database` service for data retrieval.
Traditionally, when writing unit tests for `UserService`, you would need to manually create mock objects for the
`Database` dependency and stub out its methods. This manual setup can be time-consuming and error-prone, leading to
repetitive code and increased maintenance overhead.

Take a look at the following example:

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
dependencies. The `compile()` method compiles the `TestBed` and returns an instance of the class under
test (`userService`).

During the test, you can directly access the automatically created mock object for the `Database`
dependency (`database`) - Read more in [Dependency and Instance Access](#dependency-references-and-instance-access). By stubbing the `getUsers()` method of the `database` mock object, you can define its behavior
and ensure it resolves with a specific set of mock users.

## TestBed API

Source package: `@automock/jest`

The `TestBed` API is a factory for creating `TestBedBuilder` instances. It provides a single method for creating a
`TestBedBuilder` instance.

### `TestBed.create<TClass>(classToTest): TestBedBuilder<TClass>`

The `TestBed.create(classToTest)` method initializes the `TestBed` with the class you want to test. It takes the
`classToTest` parameter, which represents the class for which you want to create an instance.

Example usage:

```typescript
const { unit, unitRef } = TestBed.create(UserService);
```

## TestBedBuilder API

Source package: `@automock/core`

The `TestBedBuilder` interface provides methods for configuring and compiling the `TestBed`.

### `.mock(type: Type<TDependency>): MockOverride<TDependency, TClass>`

The `.mock(type)` method is used to declare a dependency to be mocked using its type. It takes the `type` parameter,
which represents the type of the dependency to be mocked.

Example usage:

```typescript
const { unit, unitRef } = TestBed.create(UserService)
  .mock(Database)
  .using({ getUsers: async () => [] })
  .compile();
```

In this example, the `Database` dependency is declared to be mocked using its type. The `using()` method allows you to
provide default values or behavior for the methods of the mocked dependency.

### `.mock<TDependency>(token: string): MockOverride<TDependency, TClass>`

The `.mock(token)` method is used to declare a dependency to be mocked using a token string. It takes the `token`
parameter, which represents the token string representing the dependency to be mocked. 

When using `.mock()` method with a token, the type of the dependency is not known at compile time. To specify the type,
use the generic argument like .mock<SomeType>('MY_TOKEN'). This provides better type safety and ensures that the mocked
value aligns with the expected type.

Example usage:

```typescript
const { unit, unitRef } = TestBed.create

(UserService)
  .mock('CUSTOM_TOKEN')
  .using({ ... })
  .compile();
```

> :bulb: The `using()` method allows you to provide default values or behavior for the methods of the mocked dependency, read more in the `MockOverride` API Reference


### `.compile(): UnitTestBed<TClass>`

The `.compile()` method finalizes `TestBed` setup and returns an object that contains the instance of the class under
test (`unit`) and a reference to the mocked dependencies (`unitRef`).

Example usage:

```typescript
const { unit, unitRef } = TestBed.create(UserService).compile();
```

In this example, the `unit` property represents the actual instance of the class under test (`UserService`).

> :bulb: Read more about the `unitRef` property in the `Dependency References and Instance Access` section

## MockOverride API

Source package: `@automock/core`

The `MockOverride` interface provides methods for specifying the value or mock implementation to be used for a mocked
dependency.

### `.using(mockImplementation: TImpl): TestBedBuilder<TClass>`

The `.using(mockImplementation)` method specifies the mock implementation to be used for the mocked dependency. It takes
the `mockImplementation` parameter, which represents the mock implementation for the mocked dependency.

Example usage:

```typescript
const { unit, unitRef } = TestBed.create(UserService)
  .mock(Database)
  .using({ getUsers: async () => [{ id: 1, name: 'John' }] })
  .compile();
```

In this example, the `.using()` method is used to specify the mock implementation for the mocked dependency.
The `mockImplementation` can be an object representing the mock implementation.

> :bulb: The method returns a `TestBedBuilder` instance, allowing you to chain further configuration.

### `.using(value: TValue): TestBedBuilder<TClass>` (since `v1.2.0`)

The same goes for fixed values, the `.using(value)` method can also specify the value to be used for the mocked
dependency. It takes the `value` parameter, which represents the value for the mocked dependency.

Example usage:

```typescript
const { unit, unitRef } = TestBed.create(UserService)
  .mock('CUSTOM_TOKEN')
  .using('some fixed value')
  .compile();
```

## Dependency References and Instance Access

When utilizing `TestBed`, the `compile()` method returns an object with two important properties: `unit` and `unitRef`.
These properties provide access to the instance of the class under test and references to its dependencies,
respectively.

`unit` - The `unit` property represents the actual instance of the class under test. In our example, it corresponds to
an instance of the `UserService` class. This allows you to directly interact with the class and invoke its methods
during your test scenarios.

`unitRef` - The `unitRef` property serves as a reference to the dependencies of the class under test. In our example, it
refers to the `Database` dependency used by the `UserService`. By accessing `unitRef`, you can retrieve the
automatically generated mock object for the dependency. This enables you to stub methods, define behaviors, and assert
method invocations on the mock object.

Combining the the `unit` and `unitRef`, you have full control over the class under test and its dependencies within your
unit tests. You can manipulate the behavior of dependencies, assert method calls, and validate the expected outputs
seamlessly.
