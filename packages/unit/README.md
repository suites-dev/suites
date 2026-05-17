<p align="center">
  <img width="150" src="https://raw.githubusercontent.com/suites-dev/suites/master/logo.png" alt="Logo" />
</p>

<h1 align="center">Suites</h1>

<p align="center">
A unit-testing framework for TypeScript backends using inversion of control and dependency injection
<br />


[![npm version](https://img.shields.io/npm/v/@suites/unit.svg?style=flat-square)](https://www.npmjs.com/package/@suites/unit)
[![npm downloads](https://img.shields.io/npm/dm/@suites/unit.svg?style=flat-square)](https://www.npmjs.com/package/@suites/unit)
[![License](https://img.shields.io/npm/l/@suites/unit.svg?style=flat-square)](https://github.com/suites-dev/suites/blob/master/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

[Documentation](https://suites.dev/docs) • [GitHub](https://github.com/suites-dev/suites)

</p>

Testing classes with dependency injection usually means writing manual mocks for every constructor parameter. Change a dependency? Update every mock. Refactor a method? Hope your untyped mocks still work. Suites automates this away.

## What is Suites?

Suites is a **unit testing framework** that provides:

- **Declarative API** - Call `TestBed.solitary(YourClass)` and get a fully-typed test environment with mocks already generated and wired
- **Type-Safe Refactoring** - Add or remove constructor dependencies without touching your tests. TypeScript catches mismatches immediately
- **Framework Agnostic** - Write tests once, use the same pattern across NestJS services, InversifyJS modules, or plain TypeScript classes
- **AI Ready** - The consistent pattern makes it trivial for coding agents to generate correct tests without extensive context

Works with [NestJS](https://nestjs.com) (official), [InversifyJS](https://inversify.io) (official), [Jest](https://jestjs.io), [Vitest](https://vitest.dev), and [Sinon](https://sinonjs.org).

```typescript
import { TestBed, type Mocked } from '@suites/unit';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Mocked<UserRepository>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();
    userService = unit;
    userRepository = unitRef.get(UserRepository);
  });

  it('should return user name', async () => {
    userRepository.getUserById.mockResolvedValue({ id: 1, name: 'John Doe' });
    const result = await userService.getUserName(1);
    expect(result).toBe('John Doe');
  });
});
```

## Getting Started

**Fastest way to get started:**

[**5-Minute Quickstart Guide**](https://suites.dev/docs/get-started/quickstart)

**Explore comprehensive guides and examples:**

[View Documentation](https://suites.dev/docs) | [See Examples](https://github.com/suites-dev/suites/tree/master/examples) | [Learn Suites Patterns](https://suites.dev/docs/guides)

## Installation

```bash
npm i -D @suites/unit
```

You'll also need to install adapters for your DI framework and testing library. For example, NestJS with Jest:

```bash
npm i -D @suites/doubles.jest @suites/di.nestjs
```

[**Complete installation and setup guide**](https://suites.dev/docs/get-started/installation)

## Using Suites with AI coding agents

Suites ships its own documentation for AI coding agents (Claude Code, Cursor, GitHub Copilot, others) bundled inside the npm package. The docs are version-matched to the version you install, so the agent always references the API you actually have, not stale patterns from its training data.

After `npm install @suites/unit`, the docs sit at `node_modules/@suites/unit/dist/llm/knowledge/`. To wire them up, add these two files to the root of your project.

**`AGENTS.md`** (most AI agents read this automatically):

```md
<!-- BEGIN:suites-agent-rules -->

# Suites: read testing guidance before writing tests

When writing or modifying tests in this project, first read the relevant doc
in `node_modules/@suites/unit/dist/llm/knowledge/`. Start with `index.md`.

These docs are version-matched to the installed `@suites/*` packages and
override your training data.

<!-- END:suites-agent-rules -->
```

**`CLAUDE.md`** (only if you use Claude Code):

```md
@AGENTS.md
```

The comment markers delimit the Suites-managed section. Future updates of this README replace only what's between them, so your own additions outside the markers are safe.

This follows the same pattern Vercel adopted for Next.js 16.2 (see their [agent eval benchmark](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals), where bundled docs drove pass rate from 53% to 100%).

## Community

Join the Suites community on [GitHub Discussions](https://github.com/suites-dev/suites/discussions).

## Support

### Ask a question about Suites

[**Start a discussion**](https://github.com/suites-dev/suites/discussions/new?category=q-a)

### Create a bug report

[**Report a bug**](https://github.com/suites-dev/suites/issues/new?template=bug_report.md)

### Request a feature

[**Submit feature request**](https://github.com/suites-dev/suites/issues/new?template=feature_request.md)

## Contributing

We welcome contributions! See our [contribution guidelines](https://github.com/suites-dev/suites/blob/master/CONTRIBUTING.md) and [Code of Conduct](https://github.com/suites-dev/suites/blob/master/CODE_OF_CONDUCT.md).

## License

Distributed under the Apache (Apache-2.0) License. See `LICENSE` for more information.
