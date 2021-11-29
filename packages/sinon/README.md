[![ISC license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![npm version](http://img.shields.io/npm/v/mockingbird.svg?style=flat)](https://npmjs.org/package/mockingbird "View this project on npm")
[![Codecov Coverage](https://img.shields.io/codecov/c/github/omermorad/mockingbird/master.svg?style=flat-square)](https://codecov.io/gh/omermorad/mockingbird)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![ci](https://github.com/omermorad/mockingbird/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/omermorad/mockingbird/actions)

<p align="center">
  <img width="450" src="https://raw.githubusercontent.com/omermorad/mockingbird/master/docs/logo.png" alt="Mockingbird Logo" />

  <h1 align="center">Mockingbird</h1>

  <h3 align="center">
    Simple Yet Powerful TypeScript Mocking Library
  </h3>

  <h4 align="center">
    Manage and create your test mocks easily, and focus on your tests logic instead
  </h4>
</p>

## Installation

```bash
npm i -D mockingbird
```

```bash
yarn add -D mockingbird
```

## What is "Mocking Library"?
A lot of times you find yourself “preparing” some dummy data for your tests that
has to make sense for a specific test case(s) and is manipulated often.
Some developers are preparing JSON files, others create a long verbose object in
the test file itself, but the outcome always contains some fake data inside
(or even a snapshot from an external API).

This is what Mockingbird aims to solve!
It suggests two ways of creating mocks for your entities/models classes, thus,
creating one uniform way to manage mocks (whether you are working alone or with your team),
your dev experience will improve, and you won’t have to deal with this messy setup at all!

## Features
- Prepare as many unique mocks/fixtures as you need for your tests
- Generate dummy (but reasonable) data for database seeding
- Manage your mocks from one place, forget about the messy work
- Full TypeScript compatibility
- Convenient and simple API

## Usage

**Here is the simplest usage of Mockingbird:**

```typescript
// Could be interface as well
class BirdEntity {
  name: string;
  birthday: Date;
  goodPoints: number;
}
```

```typescript
import { Mock, MockFactory } from 'mockingbird';

// BirdEntity could be an interface or a class
class BirdEntityMock implements BirdEntity {
  @Mock(faker => faker.name.firstName())
  name!: string;

  @Mock()
  birthday!: Date; // Will generate a recent date

  @Mock()
  goodPoints!: number; // Will generate a random number
}

const oneBird = MockFactory(BirdEntityMock).one();
const lotsOfBirds = MockFactory(BirdEntityMock).many(3);
```

## Documentation
**[Jump to the full documentation and explore the full API](https://github.com/omermorad/faker.ts/blob/master/docs/README.md)**

**There's also an example, [you can find it under the sample folder](https://github.com/omermorad/mockingbird/tree/master/sample)**

## Playground

**Jump to the [REPL Playground](https://repl.it/@omermorad/Mockingbird-Playground) where you can see Mockingbird in action!**

## Motivation

Creating mocks for your tests (sometimes called "fixtures") can be a tedious and
cumbersome process usually done manually.

We came up with a simple yet super convenient solution: all you have to do to get mocks out of the
box is to decorate your classes (whether it's an entity, or a model representing the database layer)
and generate simple or complex mocks.

Mockingbird offers two different ways for preparing mocks; The first one (as we call it), is the TypeScript
way which requires decorating existing (or duplicate) classes.
The second way is to use Mockingbird's functionality directly


### What is `faker.js`?

`faker.js` it's a library which is used to "generate massive amounts of fake data in the browser and Node".

Mockingbird uses `faker.js` under the hood, making it possible to enjoy its rich database, and thereby allows
to create mocks that are meaningful like email, first name, address and many more.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements

[faker.js](https://github.com/marak/Faker.js)
