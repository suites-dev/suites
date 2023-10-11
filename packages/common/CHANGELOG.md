# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/omermorad/automock/compare/@automock/common@2.1.0...@automock/common@2.2.0) (2023-08-04)

### Features

- **common:** add symbol and type for undefined dependency ([681f670](https://github.com/omermorad/automock/commit/681f670ad93f5d6bc000ca946c14e0837bff73ea))

# [2.1.0](https://github.com/omermorad/automock/compare/@automock/common@2.0.0...@automock/common@2.1.0) (2023-07-29)

### Bug Fixes

- **core,common:** add array type to primitive values (fixed values) ([#78](https://github.com/omermorad/automock/issues/78)) ([b7f57a1](https://github.com/omermorad/automock/commit/b7f57a10e7ff3a231a2a69ba7ad3d6c79941ce82))

### Features

- **core,adapters.nestjs,common:** support property injection strategy ([#75](https://github.com/omermorad/automock/issues/75)) ([ce4c08d](https://github.com/omermorad/automock/commit/ce4c08dde68d63f95b766fa0b942d7794069d0bf))

# 2.0.0 (2023-07-01)

### Code Refactoring

- **common:** change dependencies reflector signature ([96d33a2](https://github.com/omermorad/automock/commit/96d33a28c97ad93c8bd27d50b4bdf8ab43d11308))

### BREAKING CHANGES

- **common:** The `reflectDependencies` method of `DependenciesReflector` now returns a different interface to accommodate the support for both constructor parameters and properties.

# 1.2.0 (2023-06-10)

### Features

- **common:** add primitive value type ([#57](https://github.com/omermorad/automock/issues/57)) ([6e62fde](https://github.com/omermorad/automock/commit/6e62fdeafa2956a23ab550935edb6e596d162531))

# 1.1.0 (2023-06-02)

**Note:** Version bump only for package @automock/common
