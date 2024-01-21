# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://github.com/suites-dev/suites/compare/@suites/sinon@2.0.0...@suites/sinon@2.1.0) (2023-12-09)

### Features

- **sinon:** unit reference overload methods for identifier metadata ([4f952f0](https://github.com/suites-dev/suites/commit/4f952f0a8063926afbb20a998f1da8b248610838))

# [2.0.0](https://github.com/suites-dev/suites/compare/@suites/sinon@1.4.0...@suites/sinon@2.0.0) (2023-11-10)

### Code Refactoring

- **sinon:** drop support for native nestjs adapter ([0925ea2](https://github.com/suites-dev/suites/commit/0925ea2bd729c291f97c496d63142ce5ed353b3c))
- **sinon:** drop support for node v14 and v12 ([7d81ff2](https://github.com/suites-dev/suites/commit/7d81ff24e93e1d07770f46a4d6c420491ea41c5f))
- **sinon:** improve interfaces and remove types ([0292fed](https://github.com/suites-dev/suites/commit/0292fed7309d05e7b31a616bcad9b23c814c882b))
- **sinon:** update sinon and sinon types peer dependencies ([5fa1ccf](https://github.com/suites-dev/suites/commit/5fa1ccfc34dc83af763e58da5fe5a73a95a843c3))

### Features

- **sinon:** replace @golevelup/ts-sinon with native mocking functionality ([080117b](https://github.com/suites-dev/suites/commit/080117b07738f25d4e9e6428159834a848e3e2cf))

### BREAKING CHANGES

- **sinon:** - Users will need to update their imports due to the relocation of `Type`, `UnitTestBed` and `MockFunction`.

* Adjustments may be required for the new `UnitReference` interface.

- **sinon:** The peer dependency for sinon has been narrowed from any version (\*) to a specific range (10 - 16). Additionally, a new peer dependency for @types/sinon with a version range of 9 - 10 has been introduced. Users should ensure they have the correct versions of sinon and @types/sinon installed to avoid compatibility issues.
- **sinon:** Remove built in support for NestJS adapter from package.json dependencies
- **sinon:** Setup engines for node to be 16 to 20, drop support for v12 and v14

# [1.4.0](https://github.com/suites-dev/suites/compare/@suites/sinon@1.3.1...@suites/sinon@1.4.0) (2023-08-04)

**Note:** Version bump only for package @suites/sinon

## [1.3.1](https://github.com/suites-dev/suites/compare/@suites/sinon@1.3.0...@suites/sinon@1.3.1) (2023-07-30)

**Note:** Version bump only for package @suites/sinon
