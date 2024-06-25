<p align="center">
  <img width="300" src="https://github.com/suites-dev/suites/assets/6696717/93c71c9c-2cf6-4c8e-8c2e-c3e55cba1ae6" alt="Suites Logo" />
  <br /><br />
  <img width="120" src="https://raw.githubusercontent.com/automock/automock/master/logo.png" alt="Logo" />
</p>

# Welcome to Suites at NodeJS Conf! 🎉🎉

## 👋 Hey NodeJS Conf Attendees! 

We're thrilled to have you here. You are among the first to hear about Suites, the next evolution in testing frameworks, [originating from Automock](https://github.com/automock/automock). Suites is designed to elevate your testing experience, streamline your workflows, and help you deliver high-quality software with ease.

## ❓ What is Suites?

Suites is an opinionated, flexible testing meta-framework aimed at simplifying the software testing process. It integrates a wide array of testing tools into a cohesive framework, making it easier than ever to create reliable tests and ensure your software is rock-solid.

### Key Features:

- 🚀 **Zero-Setup Mocking**: Dive straight into testing without the hassle. Automatically generate mock objects, eliminate manual setup, and reduce a lot of boilerplate code in your unit tests

- 🌟 **Seamless Integration**: Suites seamlessly integrates with popular DI and testing frameworks like NestJS and InversifyJS, and Jest, Sinon and Vitest, with more adapters on the way.

- ⚡ **Optimized Performance**: Suites ensures your unit tests run significantly faster, letting you focus on development without unnecessary waits.

## 🚀 Transinitioning from Automock to Suites

**Automock is the precursor to Suites, providing a streamlined approach to creating unit tests in dependency injection frameworks.**

**With neraly 200K monthly downloads**, Automock has set the foundation, and now Suites is building on that legacy to offer even more features and flexibility.

[![npm downloads](https://img.shields.io/npm/dm/@automock/jest.svg?label=%40automock%2Fjest)](https://npmjs.org/package/@automock/jest "View this project on npm")

[Take me to Automock repo for now](https://github.com/automock/automock)

## 🌐 Emphasizing Community and Official Support

**Suites is officially documented and supported within the NestJS and InversifyJS communities, with more DI adapters to come.**

This official support ensures that you have access to the latest features, best practices, and community-driven enhancements.

> **NestJS Official Docs**: [Automock @ NestJS Documentation](https://docs.nestjs.com/recipes/automock)
> 
> **InversifyJS Official Docs**: [Automock @ InversifyJS Documentation](https://github.com/inversify/InversifyJS/blob/master/wiki/testing.md)

<p align="center">
  <a href="https://docs.nestjs.com/recipes/automock"><img width="120" src="https://docs.nestjs.com/assets/logo-small-gradient.svg" alt="NestJS Logo" /></a> &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/inversify/InversifyJS/blob/master/wiki/testing.md"><img width="150" src="https://raw.githubusercontent.com/inversify/inversify.github.io/master/img/cover.jpg" alt="InversifyJS Logo" /></a>
</p>

## ✔️ Suites is Coming Soon!

We’re putting the final touches on Suites and it will be available in just a few days. In the meantime, check out Automock to get a taste of what's to come. Automock has paved the way for Suites, and we’re excited to bring you an even more powerful and flexible testing framework.

---

## Curious About Automock?

Visit the [Automock GitHub Repository](https://github.com/automock/automock) to learn more, and stay tuned for the Suites release!

This is just a landing page for now. We will transfer the repo from Automock very soon. Stay tuned!

Thank you for your interest in Suites! We're excited to bring this powerful tool to your development workflow. Stay tuned, and happy testing! 🎉

## Here is a quick example from Suites framework:

Take a look at the following example (using Jest, but the same applies for Sinon):

Consider the following `UserService` class:
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

Let's create a unit test for this class using Suites:
```typescript
import { TestBed, Mocked } from '@suites/unit';
import { Database, UserService } from './user.service'; 

describe('User Service Unit Spec', () => {
  let underTest: UserService; // 🧪 Declare the unit under test
  let database: Mocked<Database>; // 🎭 Declare a mocked dependency

  beforeAll(async () => {
    // 🚀 Create an isolated test env for the unit (under test) + auto generated mock objects
    const { unit, unitRef } = await TestBed.solitary(UserService).compile(); 

    underTest = unit;

    // 🔍 Retreive a dependency (mock) from the unit
    database = unitRef.get(Database);
  });

  // ✅ Test test test
  test('should return users from the database', async () => {
    const mockUsers: User[] = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
    database.getUsers.mockResolvedValue(mockUsers);

    const users = await underTest.getAllUsers();

    expect(database.getUsers).toHaveBeenCalled();
    expect(users).toEqual(mockUsers);
  });
});
```

With the use of the `TestBed`, an instance of the `UserService` class can be created with mock objects automatically
generated for its dependencies. During the test, we have direct access to the automatically generated mock object for
the `Database` dependency (database). By stubbing the `getUsers()` method of the database mock object, we can define
its behavior and make sure it resolves with a specific set of mock users.
