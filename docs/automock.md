# Automock API Reference

## Table of Contents

- [Usage Example](#usage-example)
- [TestBed API](#testbed-api)
- [TestBedBuilder API](#testbedbuilder-api)
- [MockOverride API](#mockoverride-api)
- [Dependency References and Instance Access](#dependency-references-and-instance-access)
- [Deep Mocking](#deep-mocking-in-automock)
- [Handling Multiple Injections of the Same Class](#handling-multiple-injections-of-the-same-class)
- [Handling Undefined Values and Warnings in Reflection](#handling-undefined-values-and-warnings-in-reflection)

## Usage Example

Consider a simple example where you have a `UserService` class that relies on a `Database` service for data retrieval.
Traditionally, when writing unit tests for `UserService`, you would need to manually create mock objects for the
`Database` dependency and stub out its methods. This manual setup can be time-consuming and error-prone, leading to
repetitive code and increased maintenance overhead.

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
The `mockImplementation` parameter can be an object representing the mock implementation, providing custom responses for
specific methods.

> :bulb: **Note:** When using `.using()` to provide a mock implementation, the subject being mocked (in the `.mock(...)` method)
> will be replaced completely without any stubs. This means that methods not explicitly defined in the `mockImplementation` object
> will not have any behavior. If you still want to provide stubs for specific methods while using a custom implementation, you can
> do so using Jest's `jest.fn()` (or Sinon's `sinon.stub()`).

To add a stub for a specific method, you can use the following syntax:

```typescript
const { unit, unitRef } = TestBed.create(UserService)
  .mock(Database)
  .using({ getUsers: jest.fn().mockReturnValue([{ id: 1, name: 'John' }]) })
  .compile();
```

This syntax ensures that the `getUsers` method will have the specified mock implementation and return value, while other
methods will behave as if they were replaced with an empty implementation. This allows for a more granular control of
the mock behavior when combining custom mock implementations with specific stubs.

### `.using(value: TValue): TestBedBuilder<TClass>` (since `v1.2.0`)

The `.using(value)` method allows specifying fixed values to be used for mocked dependencies. It takes the `value`
parameter, which represents the fixed value for the mocked dependency.

Example usage:

```typescript
const { unit, unitRef } = TestBed.create(UserService)
  .mock('CUSTOM_TOKEN')
  .using('some fixed value')
  .compile();
```

In this example, the `.using()` method is used to specify the fixed value for the mocked dependency. The `value`
parameter represents the value that will be returned when the mocked dependency is requested during the test execution.

> :bulb: **Note:** When using `.using()` to provide a fixed value, the subject being mocked (in the `.mock(...)` method)
> will be replaced completely by the provided value. This means that the mocked dependency will always return the specified
> value, regardless of its original implementation.

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

## Deep Mocking in Automock

Deep mocking can be a heavy operation, as it requires setting the depth of recursion to identify and mock all nested
dependencies. Additionally, using deep mocks can lead to unexpected behavior when calling methods in unit tests, as the
stubs that have been set might interfere with the desired test outcomes.

While Automock does not directly support deep mocking, we can demonstrate an example of how it might be achieved
manually:

Consider the `ClassWithModels` class, which has a dependency on the `PrismaService`. To create a deep mock for this
class, we can provide a custom mock implementation for the nested methods of the `models` property. In this example,
we'll use Jest to provide mock functions for `findUnique` and `find` under the `models.user` namespace, and `findUnique`
under the `models.animal` namespace:

```typescript
export class ClassWithModels {
  public constructor(private models: PrismaService) {}
  
  public async findUsers(): Promise<User[]> {
    return this.models.user.find();
  }
}

beforeAll(() => {
  const { unit, unitRef } = TestBed.create(ClassWithModels)
    .mock(PrismaWrapperService)
    .using({
      models: {
        user: { find: jest.fn() },
        animal: { findUnique: jest.fn() },
      },
    })
    .compile();
});
```

It's essential to approach deep mocking with caution, as it can lead to complex and hard-to-maintain test scenarios.
Instead, it's generally recommended focusing on mocking only the direct dependencies of a class to keep the tests clear,
concise, and easily understandable. This approach allows for efficient unit testing while still providing effective test
coverage.

## Handling Multiple Injections of the Same Class

When using Automock to mock dependencies in a class, if the same class is injected multiple times, Automock will
automatically mock all instances of the dependency. However, when attempting to access these dependencies using
`unitRef`, Automock will only return the first injected dependency for that token or class, and it will not
differentiate between identical dependencies.

This behavior is due to the limitation of Automock in differentiating between multiple injections of the same class. As
a result, any subsequent injections will not be directly accessible through `unitRef`.

To avoid this limitation and ensure proper access to all injected dependencies, it is recommended to use a unique
identifier for each injection. One way to achieve this, it to use a custom token when injecting the dependencies.
The `@Inject` decorator with a custom token allows both the DI container and Automock to uniquely identify and access
each specific dependency.

In the following example, we have a `UserService` class with two dependencies of type `Database`. To distinguish between
the two dependencies, we use custom tokens `DATABASE_1` and `DATABASE_2` during injection.

```typescript
import { Injectable, Inject } from '@nestjs/core';
import { TestBed } from '@automock/core';

class UserService {
  public constructor(
    @Inject('DATABASE_1') private readonly database1: Database,
    @Inject('DATABASE_2') private readonly database2: Database,
  ) {}

  public async getUsers() {
    const users1 = await this.database1.getUsers();
    const users2 = await this.database2.getUsers();

    return [...users1, ...users2];
  }
}
```

It's essential to note that the syntax for using custom tokens with the `@Inject` decorator may vary depending on the DI
framework being used. However, the concept of using custom tokens to differentiate between multiple injections is
fundamental to DI frameworks and should be supported across various frameworks.

## Handling Undefined Values and Warnings in Reflection

In certain scenarios, Automock may encounter `undefined` values while reflecting class dependencies. This can be due to
various reasons, such as issues with type reflection, unresolved dependencies resulting from circular references, or
improper parameter decoration.

To mitigate such situations, Automock employs fallback mechanisms to address `undefined` dependencies. For example, if
the actual reflected value is `undefined`, Automock might use injection tokens (strings) or framework-specific features,
such as `forwardRef` in NestJS, to provide a fallback value.

During unit testing, these fallbacks usually work seamlessly. However, it's important to be aware that Automock might
not be able to accurately detect the exact type or token of a dependency in certain situations.

### Warning for Undefined Dependencies

To assist in identifying and addressing potential issues, Automock provides warnings when it encounters
`undefined` dependencies during reflection. The warning message might look like this:

```plaintext
Automock has identified an undefined dependency with type or token '${name}' in class '${targetClass.name}'.
This warning may be caused by improper parameter decoration, issues with type reflection, or unresolved dependencies
due to circular references. Consider using the circular dependency resolution features provided by your DI framework.
```

The warning serves as a proactive measure to inform about the possibility of undefined dependencies and potential
problems they might cause when using the real DI container.
