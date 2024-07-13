# Contributing to Automock

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Contribution Process](#contribution-process)
5. [Making Changes](#making-changes)
6. [Tests and Quality Assurance](#tests-and-quality-assurance)
7. [Documentation](#documentation)
8. [Continuous Integration](#continuous-integration)
9. [Commit Guidelines](#commit-guidelines)
10. [Acknowledgements](#acknowledgements)
11. [Developer Onboarding](#developer-onboarding)

---

## Introduction

Welcome to the Automock project! Automock is designed to streamline and enhance testing experiences for developers. As a
monorepo project managed with Lerna and divided into several distinct packages, we aim to provide a comprehensive set of
tools for testing. This document outlines guidelines for contributing to Automock. We strongly recommend reading
the [Automock Documentation](https://automock.dev) to fully understand the project's functionality and goals.

Joining Automock means contributing to a mission: enhancing the quality of unit testing and testing processes. Your
involvement is key to driving this vision forward and improving Automock.

## Prerequisites

- **Node.js**: The project requires Node.js version 16.0.0 or higher.
- **Yarn**: Automock uses Yarn for dependency management. Ensure Yarn is installed on your system.

## Getting Started

### Installation and Setup

1. **Clone the Automock Repository**:
    ```bash
    git clone https://github.com/suites-dev/suites.git
    ```
2. **Install Dependencies**:
    ```bash
    yarn --frozen-lockfile
    ```

### Running Tests

Ensure everything is functioning as expected by running the test suite:

```bash
yarn test
```

## Contribution Process

### Reporting Issues and Bugs

Discover a bug? First, check our [Issue Tracker](https://github.com/suites-dev/suites/issues). If it's a new issue,
create a detailed report including steps to reproduce, expected outcomes, and actual results.

### Feature Requests

Ideas for new features are always welcome. Submit your proposal via our GitHub Repository, detailing the feature and its
potential benefits to Automock.

## Making Changes

### Writing Code

Contribute code that is clean, maintainable, and efficient, adhering to Automock's existing style and best practices.

### Tests and Quality Assurance

- Accompany new code with relevant unit or integration tests.
- Aim for high test coverage – verify with `yarn run coverage`.
- Pass all linting checks using `yarn lint`.

### Documentation

Document any changes or additions, ensuring the information is clear, accurate, and accessible.

## Continuous Integration

All pull requests undergo CI checks for:

- Test completion.
- Successful builds.
- Dependency validation and circular dependency checks.
- Coverage measurement.

## Commit Guidelines

Use clear and semantic PR title. Specify the package affected as a prefix in your PR title. Full list of packages and
prefixes:

- **common**: `packages/common` – General shared utilities and functions.
- **core**: `packages/core` – Core functionalities of Automock.
- **types**: `packages/types` – Type definitions and interfaces.
- **jest**: `packages/testbeds/jest` – Jest-specific testing utilities and integrations.
- **sinon**: `packages/testbeds/sinon` – Sinon.js related testing functionalities.
- **adapters.nestjs**: `packages/adapters/nestjs` – Adapters for NestJS integration.
- **adapters.inversify**: `packages/adapters/inversify` – Adapters for Inversify integration.

- For example: `feat(core): add new logging functionality`

For detailed guidelines on semantic commits,
visit [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary).

## Acknowledgements

We deeply value your contributions. All contributors are recognized in our release notes and we maintain a comprehensive
list of contributors.

## Developer Onboarding

Stay tuned for our comprehensive Developer Onboarding Guide, launching soon!
