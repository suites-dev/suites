# Suites Error & Warning Reference - Complete Catalog

**Purpose**: Complete reference of all user-facing errors and warnings in Suites v3.x and v4.0.0
**For**: Documentation team, AI agents, developers
**Last Updated**: 2025-10-31

---

## Table of Contents

1. [v4.0.0 Errors](#v40-errors)
2. [v4.0.0 Warnings](#v40-warnings)
3. [v3.x Errors](#v3x-errors)
4. [Error Simulation Guide](#error-simulation-guide)

---

## v4.0.0 Errors

### 1. DependencyNotConfiguredError - Expose Mode

**Location**: `packages/core/src/services/builders/sociable-unit-builder.ts:288-326`
**Triggered**: When accessing a dependency that's not exposed in expose mode with fail-fast enabled
**Version**: v4.0.0+

**Full Error Text**:
```
Dependency '[ClassName]' was not configured.

In expose mode, all dependencies are mocked by default.
Only exposed dependencies are real.

To fix this:
  - Use .expose([ClassName]) to make it real
  - Or use .mock([ClassName]).impl(...) for custom mock behavior
  - Use .disableFailFast() to restore v3.x behavior (not recommended)

Learn more: https://suites.dev/docs/v4-migration
```

**When to Use**:
- User forgot to expose a dependency in expose mode
- Dependency is accessed but not in expose list
- Fail-fast is enabled (default)

**How to Trigger**:
```typescript
// UserService depends on UserDal, but UserDal not exposed
TestBed.sociable(UserService)
  .expose(UserApiService) // Only expose this
  .compile(); // ← Throws when UserDal is accessed
```

**Code Reference**: `sociable-unit-builder.ts:302-307`

---

### 2. DependencyNotConfiguredError - Boundaries Mode

**Location**: `packages/core/src/services/builders/sociable-unit-builder.ts:288-326`
**Triggered**: When accessing a dependency that can't be auto-exposed in boundaries mode
**Version**: v4.0.0+

**Full Error Text**:
```
Dependency '[ClassName]' was not configured.

In boundaries mode, all dependencies are real by default.
Only dependencies in the boundaries array are mocked.

To fix this:
  - Add [ClassName] to boundaries: .boundaries([[ClassName], ...])
  - Or use .mock([ClassName]).impl(...) for custom mock behavior
  - Use .disableFailFast() to restore v3.x behavior (not recommended)

Learn more: https://suites.dev/docs/v4-migration
```

**When to Use**:
- Rare in boundaries mode due to auto-expose
- Might occur with circular dependencies or instantiation failures

**How to Trigger**:
```typescript
// Hard to trigger due to auto-expose
// Would need a dependency that can't be instantiated
TestBed.sociable(UserService)
  .boundaries([SomeService])
  .compile();
```

**Code Reference**: `sociable-unit-builder.ts:294-300`

---

### 3. DependencyNotConfiguredError - Null Mode

**Location**: `packages/core/src/services/builders/sociable-unit-builder.ts:288-326`
**Triggered**: When accessing a dependency with no mode configured
**Version**: v4.0.0+

**Full Error Text**:
```
Dependency '[ClassName]' was not configured.

No mode configured - dependencies are mocked by default.

To fix this:
  - Use .expose([ClassName]) to make it real
  - Or use .mock([ClassName]).impl(...) for custom mock behavior
  - Use .disableFailFast() to restore v3.x behavior (not recommended)

Learn more: https://suites.dev/docs/v4-migration
```

**When to Use**:
- No .expose() or .boundaries() called before .compile()
- Fail-fast is enabled (default)

**How to Trigger**:
```typescript
// No mode set, no dependencies configured
TestBed.sociable(UserService)
  .compile(); // ← Throws when any dependency is accessed
```

**Code Reference**: `sociable-unit-builder.ts:308-312`

---

---

## v4.0.0 Warnings

### 1. disableFailFast() Migration Helper Warning

**Location**: `packages/core/src/services/builders/sociable-unit-builder.ts:167-174`
**Triggered**: When .disableFailFast() is called
**Version**: v4.0.0+
**Severity**: Warning (not error)

**Full Warning Text**:
```
Suites Warning: .disableFailFast() is a migration helper.
Disabling fail-fast means unconfigured dependencies will return undefined,
which can lead to "lying tests" that pass when they should fail.
Consider explicitly configuring all dependencies instead.
This method will be removed in v5.0.0.
Learn more: https://suites.dev/docs/v4-migration
```

**When to Use**:
- User wants v3.x behavior temporarily
- Migration period escape hatch
- Discourage long-term use

**How to Trigger**:
```typescript
TestBed.sociable(UserService)
  .expose(SomeService)
  .disableFailFast() // ← Logs warning
  .compile();
```

**Code Reference**: `sociable-unit-builder.ts:166-178`

---

### 2. Unreachable Mock Configuration Warning

**Location**: `packages/core/src/services/builders/sociable-unit-builder.ts:241-249`
**Triggered**: When a mocked dependency is not part of the dependency graph
**Version**: v3.0.0+

**Full Warning Text**:
```
Suites Warning: Unreachable Mock Configuration Detected.
You attempted to mock '[ClassName]', which is not directly involved in the current testing context of '[TargetClass]'.
This mock will not affect the outcome of your tests because '[ClassName]' is neither a direct dependency of the tested unit nor is it
among the dependencies explicitly exposed. If '[ClassName]' does not influence the unit under test, consider removing this mock from your
setup to streamline your test configuration. However, if this mock is crucial, verify that all required dependencies are correctly exposed.
For detailed guidance on configuring sociable tests, please consult: https://suites.dev/docs.
```

**When to Use**:
- User mocked a dependency that's not in the graph
- Typo in class name
- Forgot to expose intermediate dependencies

**How to Trigger**:
```typescript
TestBed.sociable(UserService)
  .mock(UnrelatedService).impl(() => ({})) // Not in UserService graph
  .compile(); // ← Logs warning
```

**Code Reference**: `sociable-unit-builder.ts:241-249`

---

### 3. Unreachable Exposed Dependency Warning

**Location**: `packages/core/src/services/builders/sociable-unit-builder.ts:252-262`
**Triggered**: When an exposed dependency is not part of the dependency graph
**Version**: v3.0.0+

**Full Warning Text**:
```
Suites Warning: Unreachable Exposed Dependency Detected.
The dependency '[ClassName]' has been exposed but cannot be reached within the current testing context.
This typically occurs because '[ClassName]' is not a direct dependency of the unit under test ([TargetClass]) nor any
of its other exposed dependencies. Exposing '[ClassName]' without it being accessible from the unit under test or
its dependencies may lead to incorrect test configurations. To resolve this, please review and adjust your testing
setup to ensure all necessary dependencies are interconnected. Alternatively, if '[ClassName]' does not influence
the unit under test, consider removing its exposure from your test setup.
For detailed instructions and best practices, refer to our documentation: https://suites.dev/docs.
```

**When to Use**:
- User exposed a dependency that's not in the graph
- Typo in class name
- Dependency path broken

**How to Trigger**:
```typescript
TestBed.sociable(UserService)
  .expose(UnrelatedService) // Not in UserService graph
  .compile(); // ← Logs warning
```

**Code Reference**: `sociable-unit-builder.ts:252-262`

---

## v3.x Errors

### 1. Adapter Not Found Error

**Location**: `packages/unit/src/package-resolver.ts:15`
**Triggered**: When DI adapter package is not installed
**Version**: v3.0.0+

**Full Error Text**:
```
Adapter not found
```

**When to Use**:
- User hasn't installed @suites/di.nestjs or @suites/di.inversify
- Installation issue

**How to Trigger**:
- This is hard to trigger in e2e since adapters are installed
- Would need to modify package.json

**Code Reference**: `package-resolver.ts:14-16`

**Issues**:
- ❌ Too vague - doesn't say WHICH adapter
- ❌ No suggestions for how to fix
- ❌ No documentation link

**Recommended Fix**:
```
DI Adapter not found for your framework.

Suites requires a Dependency Injection adapter to work with your framework.

Available adapters:
  - NestJS: npm install @suites/di.nestjs
  - Inversify: npm install @suites/di.inversify

Learn more: https://suites.dev/docs/installation
```

---

### 2. Adapter Has No Export Error

**Location**: `packages/unit/src/package-resolver.ts:21`
**Triggered**: When adapter package exists but doesn't export 'adapter'
**Version**: v3.0.0+

**Full Error Text**:
```
Adapter has no export
```

**When to Use**:
- Corrupted adapter installation
- Version mismatch
- Internal error

**How to Trigger**:
- Hard to trigger - would need corrupted package

**Code Reference**: `package-resolver.ts:20-22`

**Issues**:
- ❌ Too vague
- ❌ No recovery steps
- ❌ Could suggest reinstalling

**Recommended Fix**:
```
DI Adapter is installed but misconfigured.

The adapter package was found but doesn't export the required 'adapter' object.
This usually indicates a corrupted installation or version mismatch.

To fix:
  1. Reinstall the adapter: npm install @suites/di.nestjs --force
  2. Verify versions match: check @suites/unit and @suites/di.nestjs versions
  3. Clear node_modules and reinstall: rm -rf node_modules && npm install

If the issue persists, please report it: https://github.com/suites-dev/suites/issues
```

---

### 3. NestJS Property Reflection - Token Undefined Error

**Location**: `packages/di/nestjs/src/property-reflection-strategies.static.ts:38`
**Triggered**: When @Inject() decorator has undefined token
**Version**: v3.0.0+

**Full Error Text**:
```
Token is undefined
```

**When to Use**:
- User wrote @Inject(undefined)
- Forward ref issue

**How to Trigger**:
```typescript
@Injectable()
class BadService {
  constructor(@Inject(undefined) private dep: any) {} // ← Error
}
```

**Code Reference**: `property-reflection-strategies.static.ts:37-39`

**Issues**:
- ❌ No context about which class/property
- ❌ No suggestions

**Recommended Fix**:
```
@Inject() decorator has undefined token.

The @Inject() decorator requires a valid token (string, symbol, or class).
Found: undefined

Common causes:
  - @Inject(undefined) - check your token definition
  - Circular dependency with forwardRef() - ensure forwardRef returns a value
  - Import issue - verify token is exported/imported correctly

Example:
  @Inject('DATABASE')  // ✅ String token
  @Inject(DATABASE_TOKEN)  // ✅ Symbol/const token
  @Inject(forwardRef(() => DatabaseService))  // ✅ Forward ref
```

---

### 4. NestJS Property Reflection - Failed Strategy

**Location**: `packages/di/nestjs/src/property-reflection-strategies.static.ts:95`
**Triggered**: Fallback when all reflection strategies fail
**Version**: v3.0.0+

**Full Error Text**:
```
Failed
```

**When to Use**:
- Internal error
- Unsupported decorator pattern
- Should rarely happen

**Code Reference**: `property-reflection-strategies.static.ts:93-97`

**Issues**:
- ❌ Extremely vague
- ❌ No context whatsoever
- ❌ No recovery path

**Recommended Fix**:
```
Failed to reflect property metadata.

Suites couldn't determine the injection token for a property dependency.
This is an internal error that shouldn't normally occur.

Please report this issue with:
  1. The class that failed
  2. Your TypeScript configuration
  3. Your NestJS version

Report here: https://github.com/suites-dev/suites/issues
```

---

## Error Simulation Matrix

### How to Trigger Each Error in E2E Tests

| # | Error Type | How to Trigger | Expected Behavior |
|---|------------|----------------|-------------------|
| 1 | Dependency not configured (expose) | `.expose(A)` but access B | Throws with expose mode message |
| 2 | Dependency not configured (null) | `.compile()` with no mode | Throws with null mode message |
| 3 | disableFailFast warning | `.disableFailFast()` | Logs migration warning |
| 4 | Unreachable mock warning | `.mock(UnrelatedClass)` | Logs unreachable warning |
| 5 | Unreachable expose warning | `.expose(UnrelatedClass)` | Logs unreachable warning |

**Note**: Mode mixing errors (expose after boundaries, boundaries after expose) are **NOT included** because TypeScript's type system prevents them at compile time. They cannot occur in real usage.

---

## E2E Simulation Test Template

```typescript
describe('Error/Warning Validation - Visual Inspection', () => {
  describe('Error #1: Dependency not configured - Expose Mode', () => {
    it('should show expose mode error', async () => {
      try {
        await TestBed.sociable(UserService)
          .expose(UserApiService)
          .compile();
      } catch (error: any) {
        console.log('\n=== ERROR #1: Dependency Not Configured (Expose Mode) ===');
        console.log(error.message);
        console.log('=== END ERROR #1 ===\n');
      }
    });
  });

  // Repeat for each error/warning...
});
```

---

## Copy-Paste Ready Error Messages

### For Documentation Website

#### DependencyNotConfiguredError (Expose Mode)

**Markdown Block**:
````markdown
## Error: Dependency Not Configured (Expose Mode)

```
Dependency 'UserDal' was not configured.

In expose mode, all dependencies are mocked by default.
Only exposed dependencies are real.

To fix this:
  - Use .expose(UserDal) to make it real
  - Or use .mock(UserDal).impl(...) for custom mock behavior
  - Use .disableFailFast() to restore v3.x behavior (not recommended)

Learn more: https://suites.dev/docs/v4-migration
```

**Cause**: You're accessing a dependency that wasn't explicitly exposed.

**Solution**:
```typescript
// Before (causes error):
TestBed.sociable(UserService)
  .expose(UserApiService)
  .compile();

// After (fixed):
TestBed.sociable(UserService)
  .expose(UserApiService)
  .expose(UserDal) // ← Added missing dependency
  .compile();
```
````

---

#### DependencyNotConfiguredError (Boundaries Mode)

**Markdown Block**:
````markdown
## Error: Dependency Not Configured (Boundaries Mode)

```
Dependency 'ApiService' was not configured.

In boundaries mode, all dependencies are real by default.
Only dependencies in the boundaries array are mocked.

To fix this:
  - Add ApiService to boundaries: .boundaries([ApiService, ...])
  - Or use .mock(ApiService).impl(...) for custom mock behavior
  - Use .disableFailFast() to restore v3.x behavior (not recommended)

Learn more: https://suites.dev/docs/v4-migration
```

**Cause**: A dependency couldn't be auto-exposed (rare with auto-expose enabled).

**Solution**:
```typescript
// If you want to mock it:
TestBed.sociable(UserService)
  .boundaries([ApiService]) // Add to boundaries
  .compile();

// Or configure it explicitly:
TestBed.sociable(UserService)
  .boundaries([OtherService])
  .mock(ApiService).impl(() => ({ ... }))
  .compile();
```
````

---

---

#### disableFailFast Warning

**Markdown Block**:
````markdown
## Warning: Using disableFailFast()

```
Suites Warning: .disableFailFast() is a migration helper.
Disabling fail-fast means unconfigured dependencies will return undefined,
which can lead to "lying tests" that pass when they should fail.
Consider explicitly configuring all dependencies instead.
This method will be removed in v5.0.0.
Learn more: https://suites.dev/docs/v4-migration
```

**Cause**: You're using the migration escape hatch.

**Recommendation**: Configure dependencies explicitly instead.

```typescript
// ⚠️ Temporary fix (not recommended):
TestBed.sociable(UserService)
  .expose(UserApiService)
  .disableFailFast()
  .compile();

// ✅ Better - fix your tests:
TestBed.sociable(UserService)
  .expose(UserApiService)
  .expose(UserDal) // Configure all deps
  .mock(DatabaseService).impl(() => ({ ... }))
  .compile();
```
````

---

#### Unreachable Mock Warning

**Markdown Block**:
````markdown
## Warning: Unreachable Mock Configuration

```
Suites Warning: Unreachable Mock Configuration Detected.
You attempted to mock 'EmailService', which is not directly involved in the current testing context of 'UserService'.
This mock will not affect the outcome of your tests because 'EmailService' is neither a direct dependency of the tested unit nor is it
among the dependencies explicitly exposed. If 'EmailService' does not influence the unit under test, consider removing this mock from your
setup to streamline your test configuration. However, if this mock is crucial, verify that all required dependencies are correctly exposed.
For detailed guidance on configuring sociable tests, please consult: https://suites.dev/docs.
```

**Cause**: You mocked a dependency that's not in the dependency graph.

**Solutions**:

1. **Remove the mock** (if it's not needed):
```typescript
// Before:
TestBed.sociable(UserService)
  .mock(EmailService).impl(() => ({ ... })) // Not used by UserService
  .compile();

// After:
TestBed.sociable(UserService)
  .compile(); // Remove unnecessary mock
```

2. **Expose intermediate dependencies** (if the mock IS needed):
```typescript
// UserService → NotificationService → EmailService
TestBed.sociable(UserService)
  .expose(NotificationService) // Expose intermediate
  .mock(EmailService).impl(() => ({ ... })) // Now reachable
  .compile();
```
````

---

#### Unreachable Expose Warning

**Markdown Block**:
````markdown
## Warning: Unreachable Exposed Dependency

```
Suites Warning: Unreachable Exposed Dependency Detected.
The dependency 'PaymentService' has been exposed but cannot be reached within the current testing context.
This typically occurs because 'PaymentService' is not a direct dependency of the unit under test (UserService) nor any
of its other exposed dependencies. Exposing 'PaymentService' without it being accessible from the unit under test or
its dependencies may lead to incorrect test configurations. To resolve this, please review and adjust your testing
setup to ensure all necessary dependencies are interconnected. Alternatively, if 'PaymentService' does not influence
the unit under test, consider removing its exposure from your test setup.
For detailed instructions and best practices, refer to our documentation: https://suites.dev/docs.
```

**Cause**: You exposed a dependency that's not in the dependency graph.

**Solutions**:

1. **Remove the expose** (if typo or not needed):
```typescript
// Before:
TestBed.sociable(UserService)
  .expose(PaymentService) // Not used by UserService
  .compile();

// After:
TestBed.sociable(UserService)
  .compile(); // Remove unnecessary expose
```

2. **Fix the dependency chain**:
```typescript
// Check your dependency graph - maybe you meant:
TestBed.sociable(OrderService) // Different class that uses PaymentService
  .expose(PaymentService)
  .compile();
```
````

---

## Summary Statistics

### Total Error/Warning Count

| Category | Count | Severity |
|----------|-------|----------|
| **v4.0.0 Errors** | 3 | Error |
| **v4.0.0 Warnings** | 3 | Warning |
| **v3.x Errors** | 2 | Error |
| **Total** | 8 | - |

**Note**: Mode mixing errors excluded - TypeScript prevents them at compile time.

### By Package

| Package | Errors | Warnings |
|---------|--------|----------|
| `@suites/core.unit` | 3 | 3 |
| `@suites/unit` | 2 | 0 |
| `@suites/di.nestjs` | 2 | 0 |

---

## Next Steps

1. **Simulate each error** in e2e test
2. **Visually inspect** output format
3. **Document issues** in audit table
4. **Provide recommendations** for improvements
