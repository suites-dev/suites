---
sidebar_position: 3
description: 'A collection of examples showcasing the functionality and versatility of Automock.'
---
---

In this example, we have a `UserService` class that depends on a `Database` class to fetch users. We'll mock
the `Database` class to test the `UserService` class in isolation.

:::tip
In software testing, a "unit" refers to the smallest testable part of an application. It can be a function, method,
procedure, module, or object. **In the context of Automock, we consider the unit to be a TypeScript class.**
:::

### Step 1: Define the Classes

Here are the two classes:

```typescript
export class Database {
  async getUsers(): Promise<User[]> { ... }
}

export class UserService {
  constructor(private database: Database) {}

  async getAllUsers(): Promise<User[]> {
    return this.database.getUsers();
  }
}
```

**Here, we consider the `UserService` to be the unit under test.**

### Step 2: Set Up the Test

**We'll use the `TestBed` factory from `@automock/jest` package to create our test environment.**

```typescript
import { TestBed } from '@automock/jest';

describe('User Service Unit Test', () => {
  let userService: UserService;
  let database: jest.Mocked<Database>;

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(UserService).compile();

    userService = unit;
    database = unitRef.get(Database);
  });

  test('should retrieve users from the database', async () => {
    const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane'}];
    database.getUsers.mockResolvedValue(mockUsers);

    const users = await userService.getAllUsers();

    expect(database.getUsers).toHaveBeenCalled();
    expect(users).toEqual(mockUsers);
  });
});
```

**In this test setup, we:**

1. Created a test environment for `UserService`.
2. Obtained the actual instance of `UserService` and a mocked instance of `Database` using `unit` and `unitRef.get
   (Database)`, respectively.
3. We mocked the `getUsers` method of the `Database` class to return a predefined list of users.
4. We then called the `getAllUsers` method of `UserService` and verified that it correctly interacts with the `Database`
   class and returns the expected users.

When invoking the `.compile()` method, all the `UserService` dependencies are replaced with mock objects.
These mock objects are essentially a collection of stubs (`jest.fn()` in the case of Jest), they are placeholders for 
the actual dependencies. **By default, these stubs return `undefined` values, meaning they do not have any predefined
behavior.**

### Step 3: Extending the Example—Adding a Logger

**Let's extend our example by adding a `Logger` interface and integrating it into the `UserService` class.**

```typescript
interface Logger {
  log(message: string): void;
}

class UserService {
  constructor(private database: Database, private logger: Logger) {}

  async getAllUsers(): Promise<User[]> {
    this.logger.log('Fetching all users...');
    return this.database.getUsers();
  }
}
```

**Now, when we set up our test, we'll also need to mock the `Logger` interface:**

```typescript
beforeAll(() => {
  let logger: jest.Mocked<Logger>;
  const { unit, unitRef } = TestBed.create(UserService).compile();

  userService = unit;
  database = unitRef.get(Database);
  logger = unitRef.get(Logger);
});

test('should log a message and retrieve users from the database', async () => {
  const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
  database.getUsers.mockResolvedValue(mockUsers);

  const users = await userService.getAllUsers();

  expect(logger.log).toHaveBeenCalledWith('Fetching all users...');
  expect(database.getUsers).toHaveBeenCalled();
  expect(users).toEqual(mockUsers);
});
```

### Step 4: Using `.mock().using()` for Mock Implementation

**Automock provides a more declarative way to specify mock implementations using the `.mock().using()` method chain.
This allows us to define the mock behavior directly when setting up the `TestBed`.**

Here's how we can modify the test setup to use this approach:

```typescript
beforeAll(() => {
  const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];

  const { unit, unitRef } = TestBed.create(UserService)
    .mock(Database)
    .using({ getUsers: async () => mockUsers })
    .compile();

  userService = unit;
  database = unitRef.get(Database);
});
```

In this approach, we've eliminated the need to manually mock the `getUsers` method in the test body. Instead, we've
defined the mock behavior directly in the test setup using `.mock().using()`. This functionality determines the final
behavior of the `getUsers` method, and cannot be changed anymore in the test suite.

### Step 5: Adding Stubs to `.mock().using()`

While the `.mock().using()` method provides a way to define the default, final behavior of the mocked method, we might
still want to add specific stubs to further control or monitor the behavior during tests.
Here's how we can achieve that:

```typescript
beforeAll(() => {
   const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];

   const { unit, unitRef } = TestBed.create(UserService)
    .mock(Database)
    .using({ getUsers: jest.fn().mockResolvedValue(mockUsers) })
    .compile();

  userService = unit;
  database = unitRef.get(Database);
});

test('should log a message, retrieve users from the database, and verify method call', async () => {
  const users = await userService.getAllUsers();

  expect(logger.log).toHaveBeenCalledWith('Fetching all users...');
  expect(database.getUsers).toHaveBeenCalled();
  expect(users).toEqual([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]);
});
```

In this step, we've added a stub for the `getUsers` method using Jest's `jest.fn()`. This allows us to both define the
mock behavior and verify that the method was called during the test.

> **ARCHIVE NOTICE:** This documentation is for the deprecated Automock library. Automock has been transformed into [Suites](https://suites.dev). This content is kept for historical reference.


In this example, we have a `UserService` class that depends on a `Database` class to fetch users. We'll mock
the `Database` class to test the `UserService` class in isolation.

:::tip
In software testing, a "unit" refers to the smallest testable part of an application. It can be a function, method,
procedure, module, or object. **In the context of Automock, we consider the unit to be a TypeScript class.**
:::

### Step 1: Define the Classes

Here are the two classes:

```typescript
export class Database {
  async getUsers(): Promise<User[]> { ... }
}

export class UserService {
  constructor(private database: Database) {}

  async getAllUsers(): Promise<User[]> {
    return this.database.getUsers();
  }
}
```

**Here, we consider the `UserService` to be the unit under test.**

### Step 2: Set Up the Test

**We'll use the `TestBed` factory from `@automock/jest` package to create our test environment.**

```typescript
import { TestBed } from '@automock/jest';

describe('User Service Unit Test', () => {
  let userService: UserService;
  let database: jest.Mocked<Database>;

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(UserService).compile();

    userService = unit;
    database = unitRef.get(Database);
  });

  test('should retrieve users from the database', async () => {
    const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane'}];
    database.getUsers.mockResolvedValue(mockUsers);

    const users = await userService.getAllUsers();

    expect(database.getUsers).toHaveBeenCalled();
    expect(users).toEqual(mockUsers);
  });
});
```

**In this test setup, we:**

1. Created a test environment for `UserService`.
2. Obtained the actual instance of `UserService` and a mocked instance of `Database` using `unit` and `unitRef.get
   (Database)`, respectively.
3. We mocked the `getUsers` method of the `Database` class to return a predefined list of users.
4. We then called the `getAllUsers` method of `UserService` and verified that it correctly interacts with the `Database`
   class and returns the expected users.

When invoking the `.compile()` method, all the `UserService` dependencies are replaced with mock objects.
These mock objects are essentially a collection of stubs (`jest.fn()` in the case of Jest), they are placeholders for 
the actual dependencies. **By default, these stubs return `undefined` values, meaning they do not have any predefined
behavior.**

### Step 3: Extending the Example—Adding a Logger

**Let's extend our example by adding a `Logger` interface and integrating it into the `UserService` class.**

```typescript
interface Logger {
  log(message: string): void;
}

class UserService {
  constructor(private database: Database, private logger: Logger) {}

  async getAllUsers(): Promise<User[]> {
    this.logger.log('Fetching all users...');
    return this.database.getUsers();
  }
}
```

**Now, when we set up our test, we'll also need to mock the `Logger` interface:**

```typescript
beforeAll(() => {
  let logger: jest.Mocked<Logger>;
  const { unit, unitRef } = TestBed.create(UserService).compile();

  userService = unit;
  database = unitRef.get(Database);
  logger = unitRef.get(Logger);
});

test('should log a message and retrieve users from the database', async () => {
  const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
  database.getUsers.mockResolvedValue(mockUsers);

  const users = await userService.getAllUsers();

  expect(logger.log).toHaveBeenCalledWith('Fetching all users...');
  expect(database.getUsers).toHaveBeenCalled();
  expect(users).toEqual(mockUsers);
});
```

### Step 4: Using `.mock().using()` for Mock Implementation

**Automock provides a more declarative way to specify mock implementations using the `.mock().using()` method chain.
This allows us to define the mock behavior directly when setting up the `TestBed`.**

Here's how we can modify the test setup to use this approach:

```typescript
beforeAll(() => {
  const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];

  const { unit, unitRef } = TestBed.create(UserService)
    .mock(Database)
    .using({ getUsers: async () => mockUsers })
    .compile();

  userService = unit;
  database = unitRef.get(Database);
});
```

In this approach, we've eliminated the need to manually mock the `getUsers` method in the test body. Instead, we've
defined the mock behavior directly in the test setup using `.mock().using()`. This functionality determines the final
behavior of the `getUsers` method, and cannot be changed anymore in the test suite.

### Step 5: Adding Stubs to `.mock().using()`

While the `.mock().using()` method provides a way to define the default, final behavior of the mocked method, we might
still want to add specific stubs to further control or monitor the behavior during tests.
Here's how we can achieve that:

```typescript
beforeAll(() => {
   const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];

   const { unit, unitRef } = TestBed.create(UserService)
    .mock(Database)
    .using({ getUsers: jest.fn().mockResolvedValue(mockUsers) })
    .compile();

  userService = unit;
  database = unitRef.get(Database);
});

test('should log a message, retrieve users from the database, and verify method call', async () => {
  const users = await userService.getAllUsers();

  expect(logger.log).toHaveBeenCalledWith('Fetching all users...');
  expect(database.getUsers).toHaveBeenCalled();
  expect(users).toEqual([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]);
});
```

In this step, we've added a stub for the `getUsers` method using Jest's `jest.fn()`. This allows us to both define the
mock behavior and verify that the method was called during the test.
