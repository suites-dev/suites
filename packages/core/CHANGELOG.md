# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://github.com/automock/automock/compare/@automock/core@2.0.0...@automock/core@2.1.0) (2023-12-09)

### Bug Fixes

- **core:** fix typo in adapter error ([0dc5fdb](https://github.com/automock/automock/commit/0dc5fdb980e4eb32a75753b43c13f657a4df2d7e))
- **core:** stringify identifier metadata in logger warning ([0ef0b92](https://github.com/automock/automock/commit/0ef0b9237b2ae02aa3c8ff9a9c25a071a4b3fa1a))
- **core:** typo in unit reference error message ([b444356](https://github.com/automock/automock/commit/b4443562718e89619673500367e8480a24689933))

### Features

- **core:** add identifier metadata object in proper interfaces ([f664206](https://github.com/automock/automock/commit/f664206b4a46d56faaf17f597fb2506c16ff9cde))
- **core:** change mock container resolving strategy ([e3708e7](https://github.com/automock/automock/commit/e3708e779d4efd143e9805ecff04458fb8e38da8))

# [2.0.0](https://github.com/automock/automock/compare/@automock/core@1.4.0...@automock/core@2.0.0) (2023-11-10)

### Code Refactoring

- **core:** drop support for node v14 and v12 ([827ff5c](https://github.com/automock/automock/commit/827ff5c833cdfdb1960012df3791b8ec01a08944))
- **core:** enhance dependency handling and error management ([0271fe0](https://github.com/automock/automock/commit/0271fe0166b01ae45b47e3e06100525b050ff869))

### BREAKING CHANGES

- **core:** - Transition from native `Error` to custom Automock errors

* Update `UnitReference.get()` to return both `ConstantValue` and `StubbedInstance`.

- **core:** Setup engines for node to be 16 to 20, drop support for v12 and v14

# [1.4.0](https://github.com/omermorad/automock/compare/@automock/core@1.3.0...@automock/core@1.4.0) (2023-08-04)

### Features

- **core:** support undefined dependency from adapter ([b85132d](https://github.com/omermorad/automock/commit/b85132d65ec4a5be7327597c47b29a4f281ff1ef))

# [1.3.0](https://github.com/omermorad/automock/compare/@automock/core@1.2.2...@automock/core@1.3.0) (2023-07-29)

### Bug Fixes

- **core,common:** add array type to primitive values (fixed values) ([#78](https://github.com/omermorad/automock/issues/78)) ([b7f57a1](https://github.com/omermorad/automock/commit/b7f57a10e7ff3a231a2a69ba7ad3d6c79941ce82))

### Features

- **core,adapters.nestjs,common:** support property injection strategy ([#75](https://github.com/omermorad/automock/issues/75)) ([ce4c08d](https://github.com/omermorad/automock/commit/ce4c08dde68d63f95b766fa0b942d7794069d0bf))

# 1.2.2 (2023-07-25)

### Bug Fixes

- **core:** broken import from common src ([8d2326a3](https://github.com/omermorad/automock/commit/8d2326a3ec33853214de767aa90ebd46517fd234))

# 1.2.1 (2023-07-01)

### Code Refactoring

- **core:** dependencies mocker to return new interface ([0881c0e4](https://github.com/omermorad/automock/commit/0881c0e468951166be3afe14454bb45d319859bd))

# 1.2.0 (2023-06-10)

### Features

- **core:** support primitive value in testbuilder api ([#59](https://github.com/omermorad/automock/issues/59)) ([ef01f7c](https://github.com/omermorad/automock/commit/ef01f7ccc95867c66f992e78d7de90c353e53671))

# 1.1.0 (2023-06-02)

**Note:** Version bump only for package @automock/core
