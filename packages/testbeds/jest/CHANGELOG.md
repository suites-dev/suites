# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://github.com/suites-dev/suites/compare/@suites/jest@2.0.0...@suites/jest@2.1.0) (2023-12-09)

### Features

- **jest:** unit reference overload methods for identifier metadata ([f8c77cf](https://github.com/suites-dev/suites/commit/f8c77cfcc4877e7ef39677f9e5e0c46956d75cb2))

# [2.0.0](https://github.com/suites-dev/suites/compare/@suites/jest@1.4.0...@suites/jest@2.0.0) (2023-11-10)

### Code Refactoring

- **jest:** drop support for jest v25.x ([18e1677](https://github.com/suites-dev/suites/commit/18e1677006698c8c5c566751451e48576a6d6bca))
- **jest:** drop support for native nestjs adapter ([85432d0](https://github.com/suites-dev/suites/commit/85432d041892bf7875d57d200cfe1af653a06003))
- **jest:** drop support for node v14 and v12 ([ef2b729](https://github.com/suites-dev/suites/commit/ef2b729c8db4e23d7f4eb7c54f56c8a0350e051b))
- **jest:** improve interfaces and remove types ([4bc96e2](https://github.com/suites-dev/suites/commit/4bc96e20c3ba54aabd23dbe6d09e0074e424b4c8))

### Features

- **jest:** replace jest-mock-extended with native mocking functionality ([6148f14](https://github.com/suites-dev/suites/commit/6148f143e1ac439b7d09d9cc7ba331c86aa6405e))

### BREAKING CHANGES

- **jest:** - Users will need to update their imports due to the relocation of `Type` and `UnitTestBed`.

* Adjustments may be required for the new `UnitReference` interface.

- **jest:** Remove built in support for NestJS adapter from package.json dependencies
- **jest:** Drop support for jest v25.x, update package.json peer deps to new jest version range
- **jest:** Setup engines for node to be 16 to 20, drop support for v12 and v14
- **jest:** Remove export of `MockFunction`

# [1.4.0](https://github.com/suites-dev/suites/compare/@suites/jest@1.3.1...@suites/jest@1.4.0) (2023-08-04)

**Note:** Version bump only for package @suites/jest

## [1.3.1](https://github.com/suites-dev/suites/compare/@suites/jest@1.3.0...@suites/jest@1.3.1) (2023-07-30)

**Note:** Version bump only for package @suites/jest

# [1.3.0](https://github.com/suites-dev/suites/compare/@suites/jest@1.2.3...@suites/jest@1.3.0) (2023-07-29)

### Features

- **core,adapters.nestjs,common:** support property injection strategy ([#75](https://github.com/suites-dev/suites/issues/75)) ([ce4c08d](https://github.com/suites-dev/suites/commit/ce4c08dde68d63f95b766fa0b942d7794069d0bf))

## [1.2.2](https://github.com/suites-dev/suites/compare/@suites/jest@1.2.1...@suites/jest@1.2.2) (2023-07-25)

### Dependencies

- **jest:** bump `@suites/core` to version 1.2.2 ([0a4eb6c8](https://github.com/suites-dev/suites/commit/0a4eb6c80026973e82dfbb256e46734293a267ad))

## [1.2.1](https://github.com/suites-dev/suites/compare/@suites/jest@1.2.0...@suites/jest@1.2.1) (2023-06-24)

**Note:** Version bump only for package @suites/jest

## [1.2.0](https://github.com/suites-dev/suites/compare/@suites/jest@1.0.1...@suites/jest@1.2.0) (2023-06-10)

**Note:** Version bump only for package @suites/jest

## [1.1.0](https://github.com/suites-dev/suites/compare/@suites/jest@1.0.1...@suites/jest@1.1.0) (2023-06-02)

### Features

- **jest:** function solely as a testbed, rely on @suites/core ([d9b2db1](https://github.com/suites-dev/suites/commit/d9b2db19385721eb4999279171a3c91b7342cdd8))

## [1.0.1](https://github.com/suites-dev/suites/compare/@suites/jest@1.0.1-next.0...@suites/jest@1.0.1) (2023-02-07)

**Note:** Version bump only for package @suites/jest

## 1.0.1-next.0 (2023-02-06)

### Bug Fixes

- **jest:** interface and string token combination ([#30](https://github.com/suites-dev/suites/issues/30)) ([5b4c213](https://github.com/suites-dev/suites/commit/5b4c2135828585c60830dda11640368b7ffd9490))
