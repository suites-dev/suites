# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.1.0](https://github.com/suites-dev/suites/compare/@suites/common@3.0.0...@suites/common@3.1.0) (2023-12-09)

### Features

- **common:** identifier metadata type resolution ([f748e1f](https://github.com/suites-dev/suites/commit/f748e1ff9c8d92199db3c13bc920d94c2e4c99dc))

# [3.0.0](https://github.com/suites-dev/suites/compare/@suites/common@2.2.0...@suites/common@3.0.0) (2023-11-10)

### Code Refactoring

- **common:** drop support for node v14 and v12 ([08f0678](https://github.com/suites-dev/suites/commit/08f06782e927f5219b8feaf3ab7cbee7a394d1e1))
- **common:** overhaul interfaces and introduce new adapters mechanism ([32ab0ab](https://github.com/suites-dev/suites/commit/32ab0ab44f5b0572c98ea3707598fa207168d488))

### Features

- **common:** add automock custom errors ([f322ec3](https://github.com/suites-dev/suites/commit/f322ec3282a130ea9cc4868fc9c6872f631de593))

### BREAKING CHANGES

- **common:** - Eliminate multiple interfaces and types:
  - `ClassDependencies`
  - `ClassCtorInjectables`
  - `ClassInjectableProperty`
  - `ClassPropsInjectables`
  - `ClassDependenciesMap`
  - `DependenciesReflector`

* Transition from `PrimitiveValue` to the more descriptive `ConstantValue`.

- **common:** Setup engines for node to be 16 to 20, drop support for v12 and v14

# [2.2.0](https://github.com/suites-dev/suites/compare/@suites/common@2.1.0...@suites/common@2.2.0) (2023-08-04)

### Features

- **common:** add symbol and type for undefined dependency ([681f670](https://github.com/suites-dev/suites/commit/681f670ad93f5d6bc000ca946c14e0837bff73ea))

# [2.1.0](https://github.com/suites-dev/suites/compare/@suites/common@2.0.0...@suites/common@2.1.0) (2023-07-29)

### Bug Fixes

- **core,common:** add array type to primitive values (fixed values) ([#78](https://github.com/suites-dev/suites/issues/78)) ([b7f57a1](https://github.com/suites-dev/suites/commit/b7f57a10e7ff3a231a2a69ba7ad3d6c79941ce82))

### Features

- **core,adapters.nestjs,common:** support property injection strategy ([#75](https://github.com/suites-dev/suites/issues/75)) ([ce4c08d](https://github.com/suites-dev/suites/commit/ce4c08dde68d63f95b766fa0b942d7794069d0bf))

# 2.0.0 (2023-07-01)

### Code Refactoring

- **common:** change dependencies reflector signature ([96d33a2](https://github.com/suites-dev/suites/commit/96d33a28c97ad93c8bd27d50b4bdf8ab43d11308))

### BREAKING CHANGES

- **common:** The `reflectDependencies` method of `DependenciesReflector` now returns a different interface to accommodate the support for both constructor parameters and properties.

# 1.2.0 (2023-06-10)

### Features

- **common:** add primitive value type ([#57](https://github.com/suites-dev/suites/issues/57)) ([6e62fde](https://github.com/suites-dev/suites/commit/6e62fdeafa2956a23ab550935edb6e596d162531))

# 1.1.0 (2023-06-02)

**Note:** Version bump only for package @suites/common
