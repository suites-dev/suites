# Suites JSDoc Style Guide

This guide defines the JSDoc documentation standards for the Suites project. Following these conventions ensures consistency across the codebase and provides excellent developer experience.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [JSDoc Tag Order](#jsdoc-tag-order)
3. [Templates by Code Element](#templates-by-code-element)
4. [Content Guidelines](#content-guidelines)
5. [Examples from Suites](#examples-from-suites)
6. [Common Patterns](#common-patterns)

---

## Core Principles

### 1. Focus on "Why", Not Just "What"
Document the purpose, benefits, and use cases. Code already shows "what" it does.

**Good:**
```typescript
/**
 * Initializes a solitary test environment builder for a specified class. In a solitary environment,
 * all dependencies are mocked by default, ensuring that tests are isolated to the class under test only.
 * This method is ideal for testing the internal logic of the class without external interactions.
 */
```

**Avoid:**
```typescript
/**
 * Creates a solitary test bed builder.
 */
```

### 2. Include Practical Examples
Every public API should have at least one runnable example with imports.

### 3. Link to Documentation
Use `@see` tags to link to relevant documentation pages on suites.dev.

### 4. Version Tracking
Always include `@since` tags to track when features were introduced.

### 5. Type Safety
Document generic type parameters with clear explanations of what they represent.

---

## JSDoc Tag Order

Use this consistent order for all JSDoc blocks:

1. `@description` (or start with description text directly)
2. `@since`
3. `@template` (for generic type parameters)
4. `@param` (for function/method parameters)
5. `@returns` (for return values)
6. `@throws` (for exceptions that might be thrown)
7. `@example` (code examples)
8. `@see` (links to documentation)
9. Other tags as needed (`@internal`, `@deprecated`, `@property`, etc.)

---

## Templates by Code Element

### Classes

```typescript
/**
 * @description
 * [Brief description of what the class does and its purpose]
 * [Additional context about when/why to use this class]
 *
 * @class [ClassName]
 * @see [link to docs]
 * @since [version]
 */
export class ClassName {
  // ...
}
```

**Example from Suites:**
```typescript
/**
 * @description
 * Provides a testing framework for unit testing classes in both isolated (solitary) and integrated (sociable)
 * environments. This class facilitates building configurable test environments tailored to specific unit tests.
 *
 * @class TestBed
 * @see https://suites.dev/docs/api-reference
 * @since 3.0.0
 */
export class TestBed {
  // ...
}
```

---

### Interfaces

```typescript
/**
 * [Brief description explaining the interface purpose]
 * [Additional context about when this interface is used]
 *
 * @template [T] [Description of generic parameter if applicable]
 * @see [link to docs]
 * @since [version]
 *
 * @example
 * import { Interface } from '@suites/package';
 *
 * const example: Interface<Type> = {
 *   // usage example
 * };
 */
export interface InterfaceName<T> {
  // properties...
}
```

**Example from Suites:**
```typescript
/**
 * Represents the testing environment for a specific class, encapsulating both the instance
 * of the class under test and references to its dependencies. This setup is crucial for
 * conducting isolated and controlled unit tests.
 *
 * @template TClass The type of the class being tested. This generic parameter ensures type safety
 * and consistency across the testing code.
 */
export interface UnitTestBed<TClass> {
  unit: TClass;
  unitRef: UnitReference;
}
```

---

### Methods (Public API)

```typescript
/**
 * @description
 * [Detailed description of what the method does]
 * [Explain the use case and when to use this method]
 * [Include any important details about behavior]
 *
 * @since [version]
 * @template [T] [Description of generic parameter]
 * @param {Type} paramName [Description of parameter and its purpose]
 * @returns {ReturnType} [Description of what is returned]
 * @throws {ErrorType} [Description of when this error is thrown]
 *
 * @example
 * import { Class } from '@suites/package';
 * import { Dependency } from './dependency';
 *
 * // Example usage with context
 * const result = await instance.method(param);
 *
 * @see [link to docs]
 */
public method<T>(param: Type): ReturnType {
  // ...
}
```

**Example from Suites:**
```typescript
/**
 * @description
 * Initializes a solitary test environment builder for a specified class. In a solitary environment,
 * all dependencies are mocked by default, ensuring that tests are isolated to the class under test only.
 * This method is ideal for testing the internal logic of the class without external interactions.
 *
 * @since 3.0.0
 * @template TClass The type of the class to be tested.
 * @param {Type<TClass>} targetClass The class for which the test environment is constructed.
 * @returns {SolitaryTestBedBuilder<TClass>} A builder to configure the solitary test environment.
 * @see https://suites.dev/docs/developer-guide/unit-tests
 *
 * @example
 * import { TestBed } from '@suites/unit';
 * import { MyService } from './my-service';
 *
 * const { unit, unitRef } = await TestBed.solitary(MyService).compile();
 */
public static solitary<TClass = any>(targetClass: Type<TClass>): SolitaryTestBedBuilder<TClass> {
  // ...
}
```

---

### Type Aliases

```typescript
/**
 * [Description of what this type represents]
 * [Explain when and how this type should be used]
 * [Document any constraints or special behaviors]
 *
 * @template [T] [Description of generic parameter]
 * @since [version]
 *
 * @example
 * import { TypeAlias } from '@suites/package';
 *
 * const example: TypeAlias<SomeType> = /* ... */;
 */
export type TypeAlias<T> = /* ... */;
```

**Good Example:**
```typescript
/**
 * Base abstract type for mocked instances. Adapters can augment this with
 * library-specific implementations (Jest, Vitest, Sinon) via module augmentation.
 *
 * @template T The type being mocked
 * @since 4.0.0
 */
export type Mocked<T> = StubbedInstance<T>;
```

**Needs Improvement:**
```typescript
/**
 * @since 3.0.0
 */
export type InjectableIdentifier<TClass = unknown> = Type<TClass> | string | symbol;
```

**Should Be:**
```typescript
/**
 * Represents an identifier that can be used to inject dependencies in a DI container.
 * Can be a class type, a string token, or a symbol token.
 *
 * @template TClass The type of the class when using class-based injection
 * @since 3.0.0
 *
 * @example
 * // Using class type
 * const identifier: InjectableIdentifier = MyService;
 *
 * @example
 * // Using string token
 * const identifier: InjectableIdentifier = 'API_KEY';
 *
 * @example
 * // Using symbol token
 * const TOKEN = Symbol('config');
 * const identifier: InjectableIdentifier = TOKEN;
 */
export type InjectableIdentifier<TClass = unknown> = Type<TClass> | string | symbol;
```

---

### Interface Properties

```typescript
interface Example {
  /**
   * [Description of the property and its purpose]
   * [Additional context if needed]
   *
   * @since [version]
   * @template [T] [Description if property is generic]
   * @property [propertyName] [Type and description]
   */
  propertyName: Type;
}
```

**Example from Suites:**
```typescript
interface UnitTestBed<TClass> {
  /**
   * The instance of the class being tested. This property provides direct access to the class,
   * allowing tests to interact with it as needed.
   * @since 3.0.0
   * @see https://suites.dev/docs/api-reference
   * @template TClass The type of the class under test.
   * @property {TClass} unit The instance of the class under test.
   */
  unit: TClass;
}
```

---

### Error Classes

Error classes need special attention with comprehensive documentation:

```typescript
/**
 * Thrown when [specific condition that triggers this error].
 *
 * This typically occurs when [common scenario that causes this error].
 * [Additional context about what this error means]
 *
 * @since [version]
 * @see [link to error documentation page]
 *
 * @example
 * // Scenario that causes the error
 * const result = unitRef.get(NonExistentDependency);
 * // throws IdentifierNotFoundError
 *
 * @example
 * // How to prevent/fix the error
 * await TestBed.solitary(MyService)
 *   .mock(SomeDependency)
 *   .impl(() => ({ method: jest.fn() }))
 *   .compile();
 */
export class CustomError extends Error {
  // ...
}
```

**Template Structure:**
1. **When it's thrown** - Clear condition
2. **Common scenarios** - Real-world cases
3. **How to prevent** - Show the fix
4. **Recovery strategies** - What to do when it occurs

---

### Constants and Exported Values

```typescript
/**
 * [Description of what this constant represents]
 * [Explain its purpose in the framework]
 *
 * @since [version]
 * @alias [if aliasing another library's export]
 * @see [link to external docs if applicable]
 * @see [link to internal docs]
 *
 * @example
 * import { constant } from '@suites/package';
 *
 * const result = constant();
 */
export const constant = /* ... */;
```

**Needs Improvement:**
```typescript
/**
 * Represents a stub function
 *
 * @since 3.0.0
 * functions replaced by stubs.
 * @alias jest.fn
 * @see https://jestjs.io/docs/mock-function-api#jestfnimplementation
 * @see https://suites.dev/docs/api-reference
 */
export const stub = jest.fn();
```

**Should Be:**
```typescript
/**
 * Creates a stub function for mocking method implementations in tests.
 * This is an alias for Jest's `jest.fn()`, providing a consistent API across
 * different testing frameworks in the Suites ecosystem.
 *
 * @since 3.0.0
 * @alias jest.fn
 * @see https://jestjs.io/docs/mock-function-api#jestfnimplementation
 * @see https://suites.dev/docs/api-reference
 *
 * @example
 * import { stub } from '@suites/doubles.jest';
 *
 * const mockFn = stub();
 * mockFn.mockReturnValue('mocked value');
 */
export const stub = jest.fn();
```

---

## Content Guidelines

### Writing Descriptions

#### DO:
- Explain the purpose and benefits
- Provide context about when to use
- Mention important behaviors or side effects
- Use clear, concise language
- Write in complete sentences
- Use active voice

#### DON'T:
- Simply restate the function name
- Use vague descriptions like "handles X"
- Omit important details
- Use overly technical jargon without explanation

---

### Writing Examples

#### Structure:
1. **Import statements** - Show where the code comes from
2. **Setup** - Any necessary preparation
3. **Usage** - The actual example
4. **Comments** - Explain non-obvious parts

#### DO:
```typescript
/**
 * @example
 * import { TestBed } from '@suites/unit';
 * import { MyService, DependencyOne, Logger } from './my-service';
 *
 * const { unit, unitRef } = await TestBed.sociable(MyService)
 *   .expose(DependencyOne)
 *   .mock(Logger)
 *   .impl({ log: jest.fn().mockReturnValue('overridden') })
 *   .compile();
 */
```

#### DON'T:
```typescript
/**
 * @example
 * TestBed.sociable(MyService).compile();
 */
```

---

### Using @see Links

#### Link to:
- Relevant documentation pages on suites.dev
- Related API methods or interfaces
- External library documentation when aliasing
- Conceptual guides that provide context

#### Format:
```typescript
@see https://suites.dev/docs/api-reference/api/testbed-api
@see https://suites.dev/docs/developer-guide/unit-tests
```

---

### Documenting Generic Type Parameters

Always explain what the generic parameter represents:

**Good:**
```typescript
/**
 * @template TClass The type of the class to be tested.
 * @template TDependency The type of the dependency being retrieved.
 */
```

**More Detail When Needed:**
```typescript
/**
 * @template TClass The type of the class being tested. This generic parameter ensures type safety
 * and consistency across the testing code.
 */
```

---

### Documenting Method Overloads

For overloaded methods, document each signature:

```typescript
export interface UnitReference {
  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to its type identifier.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param type The type representing the dependency.
   * @throws {IdentifierNotFoundError} - If the dependency is not found.
   * @returns The mocked object corresponding to the provided type identifier.
   */
  get<TDependency>(type: Type<TDependency>): StubbedInstance<TDependency>;

  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to a string-based token.
   *
   * @since 3.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param token The string-based token representing the dependency.
   * @throws {IdentifierNotFoundError} - If the dependency is not found.
   * @returns The mocked object corresponding to the provided string-based token.
   */
  get<TDependency>(token: string): StubbedInstance<TDependency>;
}
```

---

## Examples from Suites

### Excellent Example: TestBed.solitary()

```typescript
/**
 * @description
 * Initializes a solitary test environment builder for a specified class. In a solitary environment,
 * all dependencies are mocked by default, ensuring that tests are isolated to the class under test only.
 * This method is ideal for testing the internal logic of the class without external interactions.
 *
 * @since 3.0.0
 * @template TClass The type of the class to be tested.
 * @param {Type<TClass>} targetClass The class for which the test environment is constructed.
 * @returns {SolitaryTestBedBuilder<TClass>} A builder to configure the solitary test environment.
 * @see https://suites.dev/docs/developer-guide/unit-tests
 *
 * @example
 * import { TestBed } from '@suites/unit';
 * import { MyService } from './my-service';
 *
 * const { unit, unitRef } = await TestBed.solitary(MyService).compile();
 */
public static solitary<TClass = any>(targetClass: Type<TClass>): SolitaryTestBedBuilder<TClass>
```

**Why this is excellent:**
- ✅ Explains the "why" - purpose and benefits
- ✅ Provides context about use case
- ✅ Clear parameter documentation
- ✅ Complete example with imports
- ✅ Links to relevant documentation
- ✅ Version tag present

---

### Good Example: MockOverride Interface

```typescript
/**
 * Provides methods to define overrides for mocking dependencies within the testing environment.
 * This interface allows setting up specific behaviors or responses from the mocked dependencies,
 * facilitating precise and controlled testing scenarios.
 *
 * @template TDependency The type of the dependency being mocked. This generic ensures that
 * the mocks are appropriately typed, enhancing the development experience with type safety.
 * @template TClass The type of the class under test. This provides context to the TestBedBuilder,
 * linking the mock setups directly with the class being tested.
 */
export interface MockOverride<TDependency, TClass>
```

**Why this is good:**
- ✅ Explains purpose clearly
- ✅ Describes benefits
- ✅ Detailed generic parameter documentation
- ✅ Explains how generics relate to usage

---

### Example: Interface Method with Context

```typescript
/**
 * Defines a custom implementation for a mocked dependency. This method is used to set up
 * how the mock should behave when interacted with during tests.
 *
 * @since 3.0.0
 * @param mockImplementation A function that receives a stub function and returns a partial
 * implementation of the dependency. This setup allows testers to specify detailed behavior,
 * including how methods should respond when invoked.
 * @returns {TestBedBuilder} A TestBedBuilder instance, facilitating a fluent interface that allows further
 * configuration of the testing environment.
 */
impl(
  mockImplementation: (stubFn: Stub<any, ArgsType<TDependency>>) => DeepPartial<TDependency>
): TestBedBuilder<TClass>;
```

**Why this is good:**
- ✅ Explains what the method does
- ✅ Provides detailed parameter explanation
- ✅ Explains return value purpose (fluent interface)
- ✅ Contextualizes usage

---

## Common Patterns

### Pattern 1: Builder Methods

```typescript
/**
 * [What this builder method configures]
 * [Why you would use this configuration]
 *
 * @since [version]
 * @param [paramName] [What this parameter controls]
 * @returns [Next step in builder chain] [What you can do next]
 *
 * @example
 * [Show typical usage in builder chain]
 */
```

### Pattern 2: Factory Functions

```typescript
/**
 * Creates [what is created] for [purpose].
 * [Additional context about when to use]
 *
 * @since [version]
 * @template [T] [Generic parameter explanation]
 * @param [params] [Parameter descriptions]
 * @returns [What is returned and its state]
 *
 * @example
 * [Show complete usage]
 */
```

### Pattern 3: Adapter Exports

```typescript
/**
 * Adapter for [library name] to be used with Suites framework.
 * [Explain what this adapter enables]
 *
 * @see [link to Suites docs]
 * @see [link to adapted library docs]
 * @since [version]
 *
 * @example
 * import { adapter } from '@suites/doubles.[library]';
 *
 * [Show usage]
 */
```

---

## Style Conventions

### Tone and Language

- **Conversational but professional** - Match the style of suites.dev/docs
- **Developer-friendly** - Avoid unnecessary jargon
- **Benefit-focused** - Explain why, not just what
- **Clear and concise** - Respect developer's time

### Length Guidelines

- **One-line descriptions** - For simple utilities and constants
- **2-3 sentences** - For most methods and properties
- **1-2 paragraphs** - For classes, interfaces, and complex methods
- **Multiple paragraphs** - For core API entry points and complex patterns

### Formatting

- Use `@description` tag for multi-paragraph descriptions
- Start with description text directly for single-paragraph docs
- Use proper markdown in examples when needed
- Keep line length reasonable (80-120 characters)
- Use blank lines to separate logical sections

---

## Quick Reference Checklist

Before committing documentation, verify:

- [ ] Description explains "why" and benefits
- [ ] `@since` version tag is present
- [ ] Generic type parameters are documented with `@template`
- [ ] Parameters are documented with `@param`
- [ ] Return values are documented with `@returns`
- [ ] Exceptions are documented with `@throws`
- [ ] At least one practical example with imports
- [ ] Links to relevant docs with `@see`
- [ ] Examples are runnable and realistic
- [ ] Tone matches suites.dev documentation style
- [ ] No typos or grammatical errors

---

## Version History

- **4.0.0** - Initial JSDoc style guide created based on existing patterns

---

## Additional Resources

- [Suites Documentation](https://suites.dev/docs)
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [TSDoc Standard](https://tsdoc.org/)