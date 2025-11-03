# JSDoc for Builder Interfaces - Copy-Paste Ready

**Purpose**: Complete JSDoc documentation for sociable-unit-builder.ts interfaces
**For**: IDE IntelliSense hover tooltips and autocomplete
**Critical**: These interfaces are what users see when chaining methods
**File**: `packages/core/src/services/builders/sociable-unit-builder.ts`

---

## Why This Matters for IDE Experience

### The Problem
When users hover over builder methods in their IDE, they currently see:
```typescript
// ❌ Poor IDE experience - no documentation
(method) SociableTestBedBuilder<UserService>.expose(dependency: Type<any>):
  SociableTestBedBuilderInExposeMode<UserService>
```

### The Solution
With proper JSDoc, users will see:
```typescript
// ✅ Excellent IDE experience - full context
(method) SociableTestBedBuilder<UserService>.expose(dependency: Type):
  SociableTestBedBuilderInExposeMode<UserService>

Declares a dependency to be exposed (made real) in the test.
Sets the builder to "expose mode" where dependencies are mocked by default
and only explicitly exposed dependencies are real.

Cannot be used after calling .boundaries().

@param dependency - The class type to expose as a real instance
@returns The builder in expose mode for method chaining
@since 3.0.0
```

---

## Critical Insight from Web Research

**From TypeScript/IDE best practices:**
> "IntelliSense will only show TSDoc comments assigned directly to the item you're hovering over"

This means:
- ❌ **Won't work**: JSDoc on the class method only
- ✅ **Will work**: JSDoc on BOTH the interface method AND class method
- **Reason**: User hovers on interface signature, not class implementation

---

## Interface 1: SociableTestBedBuilder<TClass> (Initial State)

### Interface-Level JSDoc

```typescript
/**
 * Builder interface for configuring sociable unit tests.
 * This is the initial state where you choose your testing strategy.
 *
 * **Two mutually exclusive modes available:**
 * - **Expose mode**: Whitelist real dependencies (call `.expose()`)
 * - **Boundaries mode**: Blacklist mocked dependencies (call `.boundaries()`)
 *
 * Once you call `.expose()` or `.boundaries()`, the mode is locked for this test.
 *
 * **v4.0.0 Changes:**
 * - Fail-fast is enabled by default (throws on unconfigured dependencies)
 * - Use `.disableFailFast()` for gradual migration from v3.x
 *
 * @template TClass The type of the class under test
 * @since 4.0.0
 * @see https://suites.dev/docs/v4-migration
 * @see https://suites.dev/docs/sociable-tests
 */
export interface SociableTestBedBuilder<TClass> extends TestBedBuilder<TClass> {
```

### Method JSDoc (for each method)

#### expose() method:

```typescript
  /**
   * Declares a dependency to be exposed (made real) in the test.
   * Switches the builder to **expose mode** (whitelist strategy).
   *
   * **Expose Mode Behavior:**
   * - All dependencies are mocked by default
   * - Only explicitly exposed dependencies are real
   * - Call `.expose()` multiple times to whitelist dependencies
   *
   * **Cannot be used after calling `.boundaries()`** - modes are mutually exclusive.
   *
   * @param dependency - The class type to expose as a real instance
   * @returns Builder in expose mode (can only call expose, not boundaries)
   * @throws Error if `.boundaries()` was called before (mode conflict)
   * @since 3.0.0
   *
   * @example
   * // Expose specific dependencies, mock the rest
   * await TestBed.sociable(UserService)
   *   .expose(AuthService)
   *   .expose(DatabaseService)
   *   .compile();
   *
   * @see https://suites.dev/docs/sociable-tests#expose-mode
   */
  expose(dependency: Type): SociableTestBedBuilderInExposeMode<TClass>;
```

#### boundaries() method:

```typescript
  /**
   * Declares dependencies as boundaries (to be mocked) in the test.
   * Switches the builder to **boundaries mode** (blacklist strategy).
   *
   * **Boundaries Mode Behavior:**
   * - All dependencies are real by default (auto-exposed)
   * - Only boundary dependencies are mocked
   * - Everything else executes with real business logic
   *
   * **Use boundaries for:**
   * - Expensive class dependencies (ML/AI services, heavy computation)
   * - Flaky/external services (third-party APIs)
   * - Test scope control (limit blast radius)
   *
   * **Note:** Token injections (@Inject('TOKEN')) are always auto-mocked.
   * Leaf classes (no dependencies) are auto-exposed in boundaries mode.
   *
   * **Cannot be used after calling `.expose()`** - modes are mutually exclusive.
   *
   * @param dependencies - Array of class types to treat as boundaries (will be mocked)
   * @returns Builder in boundaries mode (can only call boundaries, not expose)
   * @throws Error if `.expose()` was called before (mode conflict)
   * @since 4.0.0
   *
   * @example
   * // Mock only expensive services, rest are real
   * await TestBed.sociable(UserService)
   *   .boundaries([RecommendationEngine, CacheService])
   *   .compile();
   *
   * @see https://suites.dev/docs/v4-migration#boundaries-mode
   */
  boundaries(dependencies: Type[]): SociableTestBedBuilderInBoundariesMode<TClass>;
```

#### disableFailFast() method:

```typescript
  /**
   * Disables fail-fast behavior for this test (migration helper).
   *
   * **WARNING:** This restores v3.x behavior where unconfigured dependencies
   * return undefined instead of throwing errors. This can lead to "lying tests"
   * that pass when they should fail.
   *
   * **This method will be removed in v5.0.0.**
   *
   * **Recommended alternative:** Configure all dependencies explicitly instead.
   *
   * @returns The same builder with fail-fast disabled
   * @deprecated Will be removed in v5.0.0
   * @since 4.0.0
   *
   * @example
   * // Temporary workaround during migration (not recommended)
   * await TestBed.sociable(UserService)
   *   .expose(AuthService)
   *   .disableFailFast()
   *   .compile();
   *
   * @see https://suites.dev/docs/v4-migration#disable-fail-fast
   */
  disableFailFast(): SociableTestBedBuilder<TClass>;
```

#### compile() method:

```typescript
  /**
   * Compiles the test bed configuration and creates the unit test environment.
   *
   * Processes all configured mocks, exposed dependencies, and boundaries,
   * then instantiates the unit under test with its dependency graph.
   *
   * **Fail-fast validation (v4.0.0):**
   * - Throws errors for unconfigured dependencies by default
   * - Use `.disableFailFast()` to restore v3.x behavior (not recommended)
   *
   * @returns Promise resolving to the compiled unit test bed with unit and unitRef
   * @throws {DependencyNotConfiguredError} If fail-fast enabled and dependency not configured
   * @throws Error if configuration conflicts detected
   * @since 3.0.0
   *
   * @example
   * const { unit, unitRef } = await TestBed.sociable(UserService)
   *   .expose(AuthService)
   *   .compile();
   *
   * @see https://suites.dev/docs/api-reference/unit-test-bed
   */
  compile(): Promise<UnitTestBed<TClass>>;
```

---

## Interface 2: SociableTestBedBuilderInExposeMode<TClass>

### Interface-Level JSDoc

```typescript
/**
 * Builder interface in **expose mode** (whitelist strategy).
 *
 * You entered this mode by calling `.expose()` on the initial builder.
 * In expose mode:
 * - All dependencies are mocked by default
 * - Only explicitly exposed dependencies are real
 * - You can call `.expose()` multiple times to whitelist more dependencies
 *
 * **Cannot switch to boundaries mode** - the mode is locked once you call `.expose()`.
 *
 * **Available methods:**
 * - `expose()` - Add more real dependencies
 * - `mock()` - Configure custom mocks (inherited from TestBedBuilder)
 * - `disableFailFast()` - Disable fail-fast for migration
 * - `compile()` - Finalize and create test bed
 *
 * @template TClass The type of the class under test
 * @since 4.0.0
 * @see https://suites.dev/docs/sociable-tests#expose-mode
 */
export interface SociableTestBedBuilderInExposeMode<TClass> extends TestBedBuilder<TClass> {
```

### Method JSDoc

#### expose() method (in expose mode):

```typescript
  /**
   * Exposes an additional dependency (makes it real).
   *
   * In expose mode, you can chain multiple `.expose()` calls to whitelist
   * all the dependencies you want to be real instances.
   *
   * @param dependency - The class type to expose as a real instance
   * @returns The same builder in expose mode (stays in expose mode)
   * @since 3.0.0
   *
   * @example
   * await TestBed.sociable(UserService)
   *   .expose(AuthService)
   *   .expose(DatabaseService)  // Chain multiple exposes
   *   .expose(Logger)
   *   .compile();
   */
  expose(dependency: Type): SociableTestBedBuilderInExposeMode<TClass>;
```

#### disableFailFast() method (in expose mode):

```typescript
  /**
   * Disables fail-fast behavior for this test (migration helper).
   *
   * In expose mode, this allows non-exposed dependencies to return undefined
   * instead of throwing errors (v3.x behavior).
   *
   * **WARNING:** Can lead to "lying tests" that pass when they should fail.
   * **Will be removed in v5.0.0.**
   *
   * @returns The same builder in expose mode with fail-fast disabled
   * @deprecated Will be removed in v5.0.0
   * @since 4.0.0
   */
  disableFailFast(): SociableTestBedBuilderInExposeMode<TClass>;
```

#### compile() method (in expose mode):

```typescript
  /**
   * Compiles the test bed with expose mode configuration.
   *
   * All explicitly exposed dependencies will be real instances.
   * All non-exposed dependencies will be mocked (or throw if fail-fast enabled).
   *
   * @returns Promise resolving to the unit test bed
   * @throws {DependencyNotConfiguredError} If accessing non-exposed dependency with fail-fast
   * @since 3.0.0
   */
  compile(): Promise<UnitTestBed<TClass>>;
```

---

## Interface 3: SociableTestBedBuilderInBoundariesMode<TClass>

### Interface-Level JSDoc

```typescript
/**
 * Builder interface in **boundaries mode** (blacklist strategy).
 *
 * You entered this mode by calling `.boundaries()` on the initial builder.
 * In boundaries mode:
 * - All dependencies are real by default (auto-exposed)
 * - Only boundary dependencies are mocked
 * - Leaf classes (no dependencies) are auto-exposed
 * - Token injections are always auto-mocked
 *
 * **Cannot switch to expose mode** - the mode is locked once you call `.boundaries()`.
 *
 * **Auto-expose behavior:**
 * Any class dependency NOT in the boundaries array is automatically made real.
 * This simplifies configuration for large dependency trees.
 *
 * **Available methods:**
 * - `mock()` - Configure custom mocks (inherited from TestBedBuilder)
 * - `disableFailFast()` - Disable fail-fast for migration
 * - `compile()` - Finalize and create test bed
 *
 * **Note:** `.expose()` is NOT available - mode is already set to boundaries.
 *
 * @template TClass The type of the class under test
 * @since 4.0.0
 * @see https://suites.dev/docs/v4-migration#boundaries-mode
 */
export interface SociableTestBedBuilderInBoundariesMode<TClass> extends TestBedBuilder<TClass> {
```

### Method JSDoc

#### disableFailFast() method (in boundaries mode):

```typescript
  /**
   * Disables fail-fast behavior for this test (migration helper).
   *
   * In boundaries mode, fail-fast rarely triggers due to auto-expose,
   * but this method is available for consistency and edge cases.
   *
   * **WARNING:** Can lead to unexpected undefined values.
   * **Will be removed in v5.0.0.**
   *
   * @returns The same builder in boundaries mode with fail-fast disabled
   * @deprecated Will be removed in v5.0.0
   * @since 4.0.0
   */
  disableFailFast(): SociableTestBedBuilderInBoundariesMode<TClass>;
```

#### compile() method (in boundaries mode):

```typescript
  /**
   * Compiles the test bed with boundaries mode configuration.
   *
   * All non-boundary dependencies will be auto-exposed (made real).
   * Only boundary dependencies will be mocked.
   * Leaf classes are auto-exposed. Tokens are auto-mocked.
   *
   * @returns Promise resolving to the unit test bed
   * @throws Error if dependencies can't be instantiated
   * @since 4.0.0
   */
  compile(): Promise<UnitTestBed<TClass>>;
```

---

## Complete File with All JSDoc Applied

**File**: `packages/core/src/services/builders/sociable-unit-builder.ts`

### Lines 12-39 (Replace current interfaces):

```typescript
/**
 * Builder interface in **expose mode** (whitelist strategy).
 *
 * You entered this mode by calling `.expose()` on the initial builder.
 * In expose mode:
 * - All dependencies are mocked by default
 * - Only explicitly exposed dependencies are real
 * - You can call `.expose()` multiple times to whitelist more dependencies
 *
 * **Cannot switch to boundaries mode** - the mode is locked once you call `.expose()`.
 *
 * **Available methods:**
 * - `expose()` - Add more real dependencies
 * - `mock()` - Configure custom mocks (inherited from TestBedBuilder)
 * - `disableFailFast()` - Disable fail-fast for migration
 * - `compile()` - Finalize and create test bed
 *
 * @template TClass The type of the class under test
 * @since 4.0.0
 * @see https://suites.dev/docs/sociable-tests#expose-mode
 */
export interface SociableTestBedBuilderInExposeMode<TClass> extends TestBedBuilder<TClass> {
  /**
   * Exposes an additional dependency (makes it real).
   *
   * In expose mode, you can chain multiple `.expose()` calls to whitelist
   * all the dependencies you want to be real instances.
   *
   * @param dependency - The class type to expose as a real instance
   * @returns The same builder in expose mode (stays in expose mode)
   * @since 3.0.0
   *
   * @example
   * await TestBed.sociable(UserService)
   *   .expose(AuthService)
   *   .expose(DatabaseService)  // Chain multiple exposes
   *   .expose(Logger)
   *   .compile();
   */
  expose(dependency: Type): SociableTestBedBuilderInExposeMode<TClass>;

  /**
   * Disables fail-fast behavior for this test (migration helper).
   *
   * In expose mode, this allows non-exposed dependencies to return undefined
   * instead of throwing errors (v3.x behavior).
   *
   * **WARNING:** Can lead to "lying tests" that pass when they should fail.
   * **Will be removed in v5.0.0.**
   *
   * @returns The same builder in expose mode with fail-fast disabled
   * @deprecated Will be removed in v5.0.0
   * @since 4.0.0
   *
   * @see https://suites.dev/docs/v4-migration#disable-fail-fast
   */
  disableFailFast(): SociableTestBedBuilderInExposeMode<TClass>;

  /**
   * Compiles the test bed with expose mode configuration.
   *
   * All explicitly exposed dependencies will be real instances.
   * All non-exposed dependencies will be mocked (or throw if fail-fast enabled).
   *
   * @returns Promise resolving to the unit test bed
   * @throws {DependencyNotConfiguredError} If accessing non-exposed dependency with fail-fast
   * @since 3.0.0
   */
  compile(): Promise<UnitTestBed<TClass>>;
}

/**
 * Builder interface in **boundaries mode** (blacklist strategy).
 *
 * You entered this mode by calling `.boundaries()` on the initial builder.
 * In boundaries mode:
 * - All dependencies are real by default (auto-exposed)
 * - Only boundary dependencies are mocked
 * - Leaf classes (no dependencies) are auto-exposed
 * - Token injections are always auto-mocked
 *
 * **Cannot switch to expose mode** - the mode is locked once you call `.boundaries()`.
 *
 * **Auto-expose behavior:**
 * Any class dependency NOT in the boundaries array is automatically made real.
 * This simplifies configuration for large dependency trees.
 *
 * **Available methods:**
 * - `mock()` - Configure custom mocks (inherited from TestBedBuilder)
 * - `disableFailFast()` - Disable fail-fast for migration
 * - `compile()` - Finalize and create test bed
 *
 * **Note:** `.expose()` is NOT available - mode is already set to boundaries.
 *
 * @template TClass The type of the class under test
 * @since 4.0.0
 * @see https://suites.dev/docs/v4-migration#boundaries-mode
 */
export interface SociableTestBedBuilderInBoundariesMode<TClass> extends TestBedBuilder<TClass> {
  /**
   * Disables fail-fast behavior for this test (migration helper).
   *
   * In boundaries mode, fail-fast rarely triggers due to auto-expose,
   * but this method is available for consistency and edge cases.
   *
   * **WARNING:** Can lead to unexpected undefined values.
   * **Will be removed in v5.0.0.**
   *
   * @returns The same builder in boundaries mode with fail-fast disabled
   * @deprecated Will be removed in v5.0.0
   * @since 4.0.0
   *
   * @see https://suites.dev/docs/v4-migration#disable-fail-fast
   */
  disableFailFast(): SociableTestBedBuilderInBoundariesMode<TClass>;

  /**
   * Compiles the test bed with boundaries mode configuration.
   *
   * All non-boundary dependencies will be auto-exposed (made real).
   * Only boundary dependencies will be mocked.
   * Leaf classes are auto-exposed. Tokens are auto-mocked.
   *
   * @returns Promise resolving to the unit test bed
   * @throws Error if dependencies can't be instantiated
   * @since 4.0.0
   */
  compile(): Promise<UnitTestBed<TClass>>;
}

/**
 * Builder interface for configuring sociable unit tests.
 * This is the initial state where you choose your testing strategy.
 *
 * **Two mutually exclusive modes available:**
 * - **Expose mode**: Whitelist real dependencies (call `.expose()`)
 * - **Boundaries mode**: Blacklist mocked dependencies (call `.boundaries()`)
 *
 * Once you call `.expose()` or `.boundaries()`, the mode is locked for this test.
 *
 * **v4.0.0 Changes:**
 * - Fail-fast is enabled by default (throws on unconfigured dependencies)
 * - Use `.disableFailFast()` for gradual migration from v3.x
 * - New `.boundaries()` method for blacklist strategy
 *
 * **Mode Selection Guide:**
 * - Use **expose mode** when you want fine-grained control (few real dependencies)
 * - Use **boundaries mode** when most dependencies should be real (few boundaries)
 *
 * @template TClass The type of the class under test
 * @since 4.0.0
 * @see https://suites.dev/docs/v4-migration
 * @see https://suites.dev/docs/sociable-tests
 *
 * @example
 * // Expose mode - whitelist real dependencies
 * await TestBed.sociable(UserService)
 *   .expose(AuthService)
 *   .expose(DatabaseService)
 *   .compile();
 *
 * @example
 * // Boundaries mode - blacklist mocked dependencies
 * await TestBed.sociable(UserService)
 *   .boundaries([RecommendationEngine, CacheService])
 *   .compile();
 */
export interface SociableTestBedBuilder<TClass> extends TestBedBuilder<TClass> {
  /**
   * Declares a dependency to be exposed (made real) in the test.
   * Switches the builder to **expose mode** (whitelist strategy).
   *
   * **Expose Mode Behavior:**
   * - All dependencies are mocked by default
   * - Only explicitly exposed dependencies are real
   * - Call `.expose()` multiple times to whitelist dependencies
   *
   * **Cannot be used after calling `.boundaries()`** - modes are mutually exclusive.
   *
   * @param dependency - The class type to expose as a real instance
   * @returns Builder in expose mode (can only call expose, not boundaries)
   * @throws Error if `.boundaries()` was called before (mode conflict)
   * @since 3.0.0
   *
   * @example
   * // Expose specific dependencies, mock the rest
   * await TestBed.sociable(UserService)
   *   .expose(AuthService)
   *   .expose(DatabaseService)
   *   .compile();
   *
   * @see https://suites.dev/docs/sociable-tests#expose-mode
   */
  expose(dependency: Type): SociableTestBedBuilderInExposeMode<TClass>;

  /**
   * Declares dependencies as boundaries (to be mocked) in the test.
   * Switches the builder to **boundaries mode** (blacklist strategy).
   *
   * **Boundaries Mode Behavior:**
   * - All dependencies are real by default (auto-exposed)
   * - Only boundary dependencies are mocked
   * - Everything else executes with real business logic
   *
   * **Use boundaries for:**
   * - Expensive class dependencies (ML/AI services, heavy computation)
   * - Flaky/external services (third-party APIs)
   * - Test scope control (limit blast radius)
   *
   * **Note:** Token injections (@Inject('TOKEN')) are always auto-mocked.
   * Leaf classes (no dependencies) are auto-exposed in boundaries mode.
   *
   * **Cannot be used after calling `.expose()`** - modes are mutually exclusive.
   *
   * @param dependencies - Array of class types to treat as boundaries (will be mocked)
   * @returns Builder in boundaries mode (can only call boundaries, not expose)
   * @throws Error if `.expose()` was called before (mode conflict)
   * @since 4.0.0
   *
   * @example
   * // Mock only expensive services, rest are real
   * await TestBed.sociable(UserService)
   *   .boundaries([RecommendationEngine, CacheService])
   *   .compile();
   *
   * @see https://suites.dev/docs/v4-migration#boundaries-mode
   */
  boundaries(dependencies: Type[]): SociableTestBedBuilderInBoundariesMode<TClass>;

  /**
   * Disables fail-fast behavior for this test (migration helper).
   *
   * **WARNING:** This restores v3.x behavior where unconfigured dependencies
   * return undefined instead of throwing errors. This can lead to "lying tests"
   * that pass when they should fail.
   *
   * **This method will be removed in v5.0.0.**
   *
   * **Recommended alternative:** Configure all dependencies explicitly instead.
   *
   * @returns The same builder with fail-fast disabled
   * @deprecated Will be removed in v5.0.0
   * @since 4.0.0
   *
   * @example
   * // Temporary workaround during migration (not recommended)
   * await TestBed.sociable(UserService)
   *   .expose(AuthService)
   *   .disableFailFast()
   *   .compile();
   *
   * @see https://suites.dev/docs/v4-migration#disable-fail-fast
   */
  disableFailFast(): SociableTestBedBuilder<TClass>;

  /**
   * Compiles the test bed configuration and creates the unit test environment.
   *
   * Processes all configured mocks, exposed dependencies, and boundaries,
   * then instantiates the unit under test with its dependency graph.
   *
   * **Fail-fast validation (v4.0.0):**
   * - Throws errors for unconfigured dependencies by default
   * - Use `.disableFailFast()` to restore v3.x behavior (not recommended)
   *
   * @returns Promise resolving to the compiled unit test bed with unit and unitRef
   * @throws {DependencyNotConfiguredError} If fail-fast enabled and dependency not configured
   * @throws Error if configuration conflicts detected
   * @since 3.0.0
   *
   * @example
   * const { unit, unitRef } = await TestBed.sociable(UserService)
   *   .expose(AuthService)
   *   .compile();
   *
   * @see https://suites.dev/docs/api-reference/unit-test-bed
   */
  compile(): Promise<UnitTestBed<TClass>>;
}
```

---

## Additional Critical Documentation Needs

### TestBedBuilder<TClass> Base Interface

**Current state**: Inherited methods (mock, impl, final) have NO JSDoc in interface
**Why critical**: Users hover on these methods too

**Methods needing JSDoc**:

```typescript
/**
 * Base builder interface providing mocking capabilities.
 * Extended by both solitary and sociable builders.
 *
 * @template TClass The type of the class under test
 * @since 3.0.0
 */
export interface TestBedBuilder<TClass> {
  /**
   * Declares a dependency to be mocked with custom implementation.
   *
   * Use this when you need to control the exact behavior of a dependency.
   * The mock will be available via `unitRef.get()` after compilation.
   *
   * **Must be followed by `.impl()` or `.final()`** to define the mock behavior.
   *
   * @template TDependency - The type of the dependency to mock
   * @param identifier - Class type or token (string/symbol) to mock
   * @returns Mock configuration object to define implementation
   * @since 3.0.0
   *
   * @example
   * // Mock a class dependency
   * TestBed.sociable(UserService)
   *   .mock(DatabaseService)
   *   .impl((stub) => ({
   *     getUser: stub().mockResolvedValue(mockUser)
   *   }))
   *   .compile();
   *
   * @example
   * // Mock a token dependency
   * TestBed.sociable(UserService)
   *   .mock<PrismaClient>('PRISMA')
   *   .impl((stub) => ({
   *     user: { findMany: stub().mockResolvedValue([]) }
   *   }))
   *   .compile();
   */
  mock<TDependency = unknown>(
    identifier: InjectableIdentifier<TDependency>
  ): MockOverride<TDependency, TClass>;
}
```

---

## IDE IntelliSense Preview

### What Users Will See When Hovering

**Before** (current):
```
(method) expose(dependency: Type<any>): SociableTestBedBuilderInExposeMode<UserService>
```

**After** (with JSDoc):
```
(method) SociableTestBedBuilder<UserService>.expose(dependency: Type):
  SociableTestBedBuilderInExposeMode<UserService>

Declares a dependency to be exposed (made real) in the test.
Switches the builder to expose mode (whitelist strategy).

Expose Mode Behavior:
• All dependencies are mocked by default
• Only explicitly exposed dependencies are real
• Call .expose() multiple times to whitelist dependencies

Cannot be used after calling .boundaries() - modes are mutually exclusive.

@param dependency — The class type to expose as a real instance
@returns — Builder in expose mode (can only call expose, not boundaries)
@since — 3.0.0

Example:
// Expose specific dependencies, mock the rest
await TestBed.sociable(UserService)
  .expose(AuthService)
  .expose(DatabaseService)
  .compile();
```

---

## Implementation Checklist

When adding this JSDoc to the actual file:

- [ ] Add JSDoc to `SociableTestBedBuilderInExposeMode` interface
- [ ] Add JSDoc to each method in `SociableTestBedBuilderInExposeMode`
- [ ] Add JSDoc to `SociableTestBedBuilderInBoundariesMode` interface
- [ ] Add JSDoc to each method in `SociableTestBedBuilderInBoundariesMode`
- [ ] Add JSDoc to `SociableTestBedBuilder` interface
- [ ] Add JSDoc to each method in `SociableTestBedBuilder`
- [ ] Verify all `@see` links are valid
- [ ] Test in IDE (VS Code) to see hover tooltips
- [ ] Verify examples are runnable
- [ ] Check for typos and consistency

---

## Testing the Documentation

### Manual IDE Test:
1. Open e2e test file
2. Type `TestBed.sociable(UserService).` and wait for autocomplete
3. Hover over `.expose()` - should see full JSDoc
4. Call `.expose(Service)` then type `.` - should see only expose mode methods
5. Hover over methods - should see mode-specific documentation

### What Good Documentation Looks Like in IDE:
- **Title**: Method signature with types
- **Description**: Clear explanation (2-3 sentences)
- **Parameters**: What each param does
- **Returns**: What you get back
- **Throws**: What errors to expect
- **Example**: Runnable code snippet
- **Links**: Direct links to docs

---

## Notes for Implementation

### Inheritance and JSDoc
- `extends TestBedBuilder<TClass>` - Methods are inherited
- **But JSDoc is NOT inherited** by IDE IntelliSense
- Must document methods in interface even if implementation has JSDoc
- Keep interface JSDoc focused on "what you can do now"
- Keep class JSDoc focused on "how it works internally"

### Version Tags
- Use `@since 3.0.0` for existing methods (expose, compile)
- Use `@since 4.0.0` for new methods (boundaries, disableFailFast)
- Use `@since 4.0.0` for new interfaces (mode-specific builders)

### Link Strategy
- Main docs: `https://suites.dev/docs/sociable-tests`
- Migration guide: `https://suites.dev/docs/v4-migration`
- Specific features: `https://suites.dev/docs/v4-migration#boundaries-mode`
