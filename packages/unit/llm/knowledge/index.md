---
name: index
version: "3.x"
audience: agent
---

# Suites knowledge for AI coding agents

You are about to write or modify a unit test in a project that uses `@suites/unit`. Read the file from this directory that matches what you are doing. The content here is version-matched to the installed `@suites/*` packages and overrides whatever you learned during training.

## What to read, by task

| What you are doing | Read this file |
|---|---|
| Writing your first test in this project, or unsure where to start | `di-testing-with-suites.md` |
| Picking between isolated and integrated tests | `solitary-vs-sociable.md` |
| Refreshing on general unit-test discipline (framework-agnostic) | `writing-tests.md` |
| About to use `Test.createTestingModule`, `jest.spyOn`, or `vi.mock` | `common-mistakes.md` first |
| Configuring mocks for `@Inject('TOKEN')` or symbol-keyed dependencies | `solitary-vs-sociable.md`, then `di-testing-with-suites.md` |

## The three rules you must not break

1. Use `TestBed.solitary(YourClass)` or `TestBed.sociable(YourClass)`. Never use NestJS's `Test.createTestingModule` for a unit test that exercises a single class.
2. Token-injected dependencies (`@Inject('TOKEN')`, symbols, `LazyServiceIdentifier`) are auto-mocked. Never hand-build a mock object for them. Never pass a token to `.expose(...)`.
3. Configure mocks through the API Suites gives you. Pre-compile, shared across tests: `.mock(Dep).final(impl)` (frozen, not retrievable) or `.mock(Dep).impl(stubFn => impl)` (retrievable). Per-test: `unitRef.get(Dep).method.mockReturnValue(...)`. Do not call `jest.mock('@suites/...')`, `vi.mock`, or `jest.spyOn` on the unit under test.

## Reading order if you have no specific task

1. `writing-tests.md` (general unit-test discipline, framework-agnostic)
2. `di-testing-with-suites.md` (the Suites API: `solitary`, `sociable`, `unitRef`)
3. `solitary-vs-sociable.md` (when to use which mode)
4. `common-mistakes.md` (anti-patterns to avoid)

## Where this content comes from

This directory is bundled inside the installed `@suites/unit` npm package at `node_modules/@suites/unit/dist/llm/knowledge/`. It ships from the Suites monorepo. The version of these docs matches the version of `@suites/unit` you have installed; mismatched API guidance is impossible by construction.

If you need to verify the package version, look at the installed `package.json`. If you find a file in this directory that contradicts the installed library, treat the installed library as authoritative and stop following these docs.
