# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.1](https://github.com/suites-dev/suites/compare/@suites/types@2.0.0...@suites/types@2.0.1) (2023-12-09)

**Note:** Version bump only for package @suites/types

# [2.0.0](https://github.com/suites-dev/suites/compare/@suites/types@1.2.0...@suites/types@2.0.0) (2023-11-10)

### Features

- **types:** simplify deep partial and stubbed instance types ([8831892](https://github.com/suites-dev/suites/commit/883189234ba008695499464eda4a15e65bf81374))

### BREAKING CHANGES

- **types:** Removed array handling in `DeepPartial` and changed structure of `StubbedInstance`. This change narrows the type to only include stubbed members, removing the intersection with the original class type.

# 1.2.0 (2023-06-10)

**Note:** Version bump only for package @suites/types

# 1.1.0 (2023-06-02)

**Note:** Version bump only for package @suites/types
