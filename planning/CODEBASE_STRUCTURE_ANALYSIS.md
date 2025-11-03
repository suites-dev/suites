# Suites Testing Framework - Codebase Structure Analysis

## Executive Summary

This document provides a comprehensive exploration of the Suites testing framework codebase, focusing on packages/core and packages/unit. The framework provides a TestBed abstraction for both solitary (isolated) and sociable (integrated) unit testing with support for dependency injection and mocking.

---

## Directory Structure

### packages/core/src
Root-level files and services for core testing infrastructure:
```
packages/core/src/
├── errors/
│   └── dependency-not-configured.error.ts      # Error for unconfigured dependencies
├── services/
│   ├── builders/
│   │   ├── testbed-builder.ts                  # Abstract base builder
│   │   ├── sociable-unit-builder.ts            # Sociable mode implementation
│   │   └── solitary-unit-builder.ts            # Solitary mode implementation
│   ├── dependency-container.ts                 # Container for pre-configured mocks
│   ├── dependency-map.ts                       # Cache for resolved dependencies
│   ├── dependency-resolver.ts                  # Core resolution logic
│   ├── unit-mocker.ts                          # Unit construction orchestrator
│   ├── unit-reference.ts                       # Mock dependency access
│   ├── functions.static.ts                     # Utility functions
│   ├── dependency-container.spec.ts            # Tests
│   ├── unit-mocker.spec.ts                     # Tests
│   └── unit-reference.spec.ts                  # Tests
├── normalize-identifier.static.ts              # Identifier normalization
├── types.ts                                    # Core type definitions
└── index.ts                                    # Public exports

**Total Source Files: 11 core + 3 spec files**
```

### packages/unit/src
High-level TestBed API and adapter resolution:
```
packages/unit/src/
├── testbed.ts                                  # Public TestBed API
├── testbed-builder.ts                          # Adapter resolution factory
├── package-resolver.ts                         # Dynamic adapter loading
├── types.ts                                    # Public type definitions
└── index.ts                                    # Public exports

**Total Source Files: 5 files**
```

---

## Key Classes and Their Responsibilities

### 1. TestBed (packages/unit/src/testbed.ts)
**File**: `/Users/omer/projects/suites/suites/packages/unit/src/testbed.ts`

**Responsibility**: Public API entry point for creating test environments

**Key Methods**:
- `static solitary<TClass>(targetClass)` - Creates solitary test builder (all deps mocked)
- `static sociable<TClass>(targetClass)` - Creates sociable test builder (configurable deps)

**Role in Architecture**:
- Routes to appropriate builder factory
- Passes through adapter registries (DI and Doubles)
- Delegates actual construction to factories

**Key Interfaces Exposed**:
- `SolitaryTestBedBuilder<TClass>`
- `SociableTestBedBuilder<TClass>`

---

### 2. TestBedBuilder (packages/core/src/services/builders/testbed-builder.ts)
**File**: `/Users/omer/projects/suites/suites/packages/core/src/services/builders/testbed-builder.ts`

**Responsibility**: Abstract base class for builder pattern implementation

**Protected Collections**:
```typescript
- identifiersToBeMocked: IdentifierToMockImplWithCb[]    // .mock().impl()
- identifiersToBeFinalized: IdentifierToFinal[]          // .mock().final()
```

**Key Methods**:
- `mock<TDependency>(identifier, metadata?)` - Declares a dependency to mock
  - Returns `MockOverride` with `.impl()` and `.final()` methods
- `abstract compile()` - Must be implemented by subclasses

**Mock Overrides**:
- `.impl(callback)` - Configure with stub functions
- `.final(value)` - Replace with concrete value

---

### 3. SociableTestBedBuilder (packages/core/src/services/builders/sociable-unit-builder.ts)
**File**: `/Users/omer/projects/suites/suites/packages/core/src/services/builders/sociable-unit-builder.ts`

**Responsibility**: Builder for sociable (integrated) testing with two mutually exclusive modes

**Mode Architecture**:
```typescript
mode: 'expose' | 'boundaries' | null

// Interfaces for type-safe mode progression:
- SociableTestBedBuilder<TClass>              // Initial state (can choose mode)
  ├─ SociableTestBedBuilderInExposeMode<TClass>
  └─ SociableTestBedBuilderInBoundariesMode<TClass>
```

**Key State**:
```typescript
- classesToExpose: Type[] = []           // For expose mode
- boundaryClasses: Type[] = []           // For boundaries mode
- mode: 'expose' | 'boundaries' | null = null
- failFastEnabled: boolean = true        // v4.0.0: Default enabled
```

**Key Methods**:
- `expose(dependency)` - Declare dependency as real (expose mode)
- `boundaries(dependencies)` - Declare dependencies as mocked (boundaries mode)
- `disableFailFast()` - Disable fail-fast for migration (deprecated)
- `compile()` - Build the test environment

**Mutual Exclusion Enforcement**:
- Calling `.expose()` after `.boundaries()` throws error
- Calling `.boundaries()` after `.expose()` throws error
- Type system enforces this via interface progression

**Compilation Process** (lines 189-275):
1. Merge mock configurations (.impl() and .final())
2. Call `UnitMocker.constructUnit()` with resolver options
3. Process resolution summary (unreachable mocks/exposes warning)
4. Include auto-exposed classes for boundaries mode
5. Return UnitTestBed with compiled unit and unitRef

---

### 4. SolitaryTestBedBuilder (packages/core/src/services/builders/solitary-unit-builder.ts)
**File**: `/Users/omer/projects/suites/suites/packages/core/src/services/builders/solitary-unit-builder.ts`

**Responsibility**: Builder for solitary (isolated) testing where all deps are mocked

**Configuration**:
```typescript
mode: null
boundaryClasses: []
failFastEnabled: false              // No fail-fast needed - all mocked anyway
autoExposeEnabled: false
```

**Key Method**:
- `compile()` - Process mocks and build test environment

**Warning Handling**:
- Detects redundant mock configurations (unreachable mocks)
- Logs warnings for dependencies not used by unit under test

---

### 5. DependencyResolver (packages/core/src/services/dependency-resolver.ts)
**File**: `/Users/omer/projects/suites/suites/packages/core/src/services/dependency-resolver.ts`

**Responsibility**: Core resolution logic for all dependencies - orchestrates priority-based decisions

**Key State**:
```typescript
- dependencyMap: DependencyMap              // Cache of resolved dependencies
- availableClassesToExpose: Set<Type>       // Classes found in dependency graph
- autoExposedClasses: Set<Type>             // Classes auto-exposed in boundaries mode
- options: ResolverOptions                  // Immutable configuration
```

**Constructor Parameters**:
```typescript
new DependencyResolver(
  classesToExpose: Type[],                  // Explicitly exposed dependencies
  mockedFromBeforeContainer: DependencyContainer,  // Pre-configured mocks
  adapter: DependencyInjectionAdapter,     // DI framework adapter
  mockFunction: MockFunction,              // Mock creation function
  options: ResolverOptions                 // Resolution configuration
)
```

**Resolution Options Interface**:
```typescript
interface ResolverOptions {
  mode: 'expose' | 'boundaries' | null;
  boundaryClasses: Type[];
  failFastEnabled: boolean;
  autoExposeEnabled: boolean;
}
```

### CRITICAL: Resolution Priority Order (lines 19-26, 66-142)

This is THE MOST IMPORTANT METHOD - controls all dependency resolution:

```typescript
public resolveOrMock(identifier, metadata?): Type | FinalValue | StubbedInstance<unknown> {
  // PRIORITY 1: Cache hit
  if (this.dependencyMap.has(identifier)) {
    return this.dependencyMap.get(identifier);
  }

  // PRIORITY 2: Explicit mocks from .mock().impl() or .mock().final()
  const existingMock = this.mockedFromBeforeContainer.resolve(identifier, metadata);
  if (existingMock !== undefined) {
    this.dependencyMap.set(identifier, existingMock, metadata);
    return existingMock;
  }

  // PRIORITY 3: Boundaries check (boundaries mode only)
  if (
    this.options.mode === 'boundaries' &&
    typeof identifier === 'function' &&
    this.options.boundaryClasses.includes(identifier)
  ) {
    const mock = this.mockFunction();
    this.dependencyMap.set(identifier, mock, metadata);
    return mock;
  }

  // PRIORITY 4: Tokens/Primitives (ALWAYS mocked - natural boundaries)
  if (this.isLeafOrPrimitive(identifier)) {
    // Special case: exposed leaf classes in expose mode
    if (typeof identifier === 'function' && this.classesToExpose.includes(identifier)) {
      return this.instantiateClass(identifier, metadata);
    }
    const mock = this.mockFunction();
    this.dependencyMap.set(identifier, mock, metadata);
    return mock;
  }

  // PRIORITY 5: Auto-expose (boundaries mode only)
  if (this.options.autoExposeEnabled && typeof identifier === 'function') {
    this.autoExposedClasses.add(identifier);
    return this.instantiateClass(identifier as Type, metadata);
  }

  // PRIORITY 6: Explicitly exposed (expose mode only)
  if (typeof identifier === 'function' && this.classesToExpose.includes(identifier)) {
    return this.instantiateClass(identifier, metadata);
  }

  // PRIORITY 7: Fail-fast or auto-mock
  if (this.options.failFastEnabled) {
    const name = typeof identifier === 'function' ? identifier.name : String(identifier);
    throw new DependencyNotConfiguredError(
      name,
      this.options.mode,
      this.classesToExpose,
      this.options.boundaryClasses
    );
  }

  // PRIORITY 8: Backward compatibility - auto-mock
  if (typeof identifier === 'function') {
    const mock = this.mockFunction();
    this.dependencyMap.set(identifier, mock, metadata);
    return mock;
  }

  // PRIORITY 9: Fallback for non-function identifiers
  const mock = this.mockFunction();
  this.dependencyMap.set(identifier, mock, metadata);
  return mock;
}
```

**Important Design Properties**:
- **Immutable configuration**: All decisions based on immutable `options`
- **No side effects**: Except for caching in `dependencyMap`
- **Idempotent**: Same identifier always returns same instance (from cache)

---

### 6. Token Detection: isLeafOrPrimitive (lines 46-51)

**Method**:
```typescript
public isLeafOrPrimitive(identifier: InjectableIdentifier): boolean {
  return (
    typeof identifier !== 'function' ||
    this.adapter.inspect(identifier as Type).list().length === 0
  );
}
```

**Logic**:
- Returns `true` if identifier is NOT a function (string/symbol token)
- OR if it's a function with NO injectable dependencies
- This identifies dependencies that can't be further decomposed

**Token Types**:
- String tokens: `'API_URL'`, `'DATABASE_HOST'`
- Symbol tokens: `Symbol('TOKEN')`
- Primitive types: Numbers, strings passed directly
- Functions with no dependencies

**Treatment**: Always mocked regardless of mode (lines 93-103)

---

### 7. Instantiation Logic: instantiateClass (lines 144-183)

**Method Flow**:
1. Check cache first (line 148-149)
2. Get injectables from DI adapter (line 152)
3. Track available classes for exposure warnings (lines 154-158)
4. Separate constructor params from properties (lines 160-161, 173)
5. Recursively resolve constructor params (lines 162-168)
6. Instantiate class with resolved params (line 170)
7. Cache instance (line 171)
8. Inject property dependencies (lines 173-180)
9. Return instance (line 182)

**Cache Strategy**:
- Instance cached after construction
- Properties can override cache (line 179)
- Ensures single instance per class per resolution chain

---

### 8. UnitMocker (packages/core/src/services/unit-mocker.ts)
**File**: `/Users/omer/projects/suites/suites/packages/core/src/services/unit-mocker.ts`

**Responsibility**: Orchestrator for constructing unit test instances

**Key Interfaces**:
```typescript
interface MockedUnit<TClass> {
  container: DependencyContainer;
  instance: TClass;
  resolution: {
    notFound: IdentifierToMockOrFinal[];
    mocks: { metadata?: unknown; identifier: Type }[];
    exposes: Type[];
  };
  autoExposedClasses: Type[];
}

interface ResolverOptions {
  mode: 'expose' | 'boundaries' | null;
  boundaryClasses: Type[];
  failFastEnabled: boolean;
  autoExposeEnabled: boolean;
}
```

**Key Method** (lines 56-82):
```typescript
async constructUnit<TClass>(
  targetClass: Type<TClass>,
  classesToExpose: Type[],
  mockContainer: DependencyContainer,
  options: ResolverOptions
): Promise<MockedUnit<TClass>>
```

**Process**:
1. Create DependencyResolver with config
2. Call `instantiateClass()` on target
3. Extract resolved dependencies (excluding target)
4. Return container with instance and metadata

---

### 9. DependencyContainer (packages/core/src/services/dependency-container.ts)
**File**: `/Users/omer/projects/suites/suites/packages/core/src/services/dependency-container.ts`

**Responsibility**: Store and retrieve pre-configured mocks by identifier

**Key Data Structure**:
```typescript
type IdentifierToMockOrFinal = [
  Pick<ClassInjectable, 'identifier'> & { metadata?: unknown },
  StubbedInstance<unknown> | FinalValue,
];
```

**Key Methods**:
- `resolve(identifier, metadata?)` - Retrieve mock or final value
- `list()` - Get all stored dependencies

**Matching Logic**:
- Single identifier with no metadata: Match by identifier only
- Multiple identifiers with same ID: Match by metadata equality
- Deep strict equality for metadata comparison

---

### 10. DependencyMap (packages/core/src/services/dependency-map.ts)
**File**: `/Users/omer/projects/suites/suites/packages/core/src/services/dependency-map.ts`

**Responsibility**: Cache resolved dependencies during resolution

**Simple Cache Implementation**:
```typescript
private resolvedDependencies: IdentifierToMockOrFinal[] = []

- has(identifier) - Check if resolved
- set(identifier, value, metadata) - Store resolution
- get(identifier) - Retrieve from cache
- entries() - Get all cached entries
```

---

### 11. DependencyNotConfiguredError (packages/core/src/errors/dependency-not-configured.error.ts)
**File**: `/Users/omer/projects/suites/suites/packages/core/src/errors/dependency-not-configured.error.ts`

**Responsibility**: Metadata-rich error for fail-fast mode

**Error Metadata**:
```typescript
class DependencyNotConfiguredError extends Error {
  readonly identifier: string;                    // Dependency name
  readonly mode: 'expose' | 'boundaries' | null;  // Testing mode
  readonly configuredExposes: readonly Type[];    // All exposed deps
  readonly configuredBoundaries: readonly Type[]; // All boundaries
}
```

**Message Generation**: Deferred to SociableTestBedBuilder (lines 287-325)
- Different messages for expose vs. boundaries mode
- Provides actionable suggestions
- Single source of truth for user-facing messages

---

### 12. UnitReference (packages/core/src/services/unit-reference.ts)
**File**: `/Users/omer/projects/suites/suites/packages/core/src/services/unit-reference.ts`

**Responsibility**: Controlled access to mocked dependencies with validation

**Key State**:
```typescript
- mocksContainer: DependencyContainer          // All mocked instances
- exposedInstances: InjectableIdentifier[]     // Exposed real dependencies
- fakedDependencies: IdentifierToFinal[]       // Dependencies configured with .final()
```

**Validation in get() method** (lines 80-141):
```
1. Check if dependency is faked (configured with .final())
   → Throw: Faked dependencies not retrievable
2. Check if dependency is exposed (configured with .expose())
   → Throw: Exposed dependencies not retrievable
3. Resolve from mocks container
   → Throw: Dependency not found if undefined
4. Return mocked instance
```

**Purpose**: Prevent accessing:
- Real instances (exposed dependencies)
- Concrete replacements (final values)
- Non-existent dependencies

---

## Mode-Specific Behavior

### Expose Mode (Whitelist)
**When used**: `TestBed.sociable(Service).expose(Dep1).expose(Dep2)`

**Behavior**:
```
Default: Everything is MOCKED
Whitelist: Only exposed dependencies are REAL
Tokens: Always MOCKED regardless
```

**Resolution Flow**:
1. Explicit mocks (highest priority)
2. Exposed dependencies → instantiated real
3. Tokens → always mocked
4. All others → mocked or fail-fast

**Auto-expose**: DISABLED

---

### Boundaries Mode (Blacklist)
**When used**: `TestBed.sociable(Service).boundaries([Boundary1, Boundary2])`

**Behavior**:
```
Default: Everything is REAL
Blacklist: Only boundary dependencies are MOCKED
Tokens: Always MOCKED regardless
```

**Resolution Flow**:
1. Explicit mocks (highest priority)
2. Boundary classes → mocked
3. Tokens → always mocked
4. Auto-expose (ENABLED) → all other real classes → real
5. Fail-fast if not covered

**Auto-expose**: ENABLED (tracks classes automatically exposed)

---

### Solitary Mode
**When used**: `TestBed.solitary(Service).mock(...)`

**Behavior**:
```
Default: ALL dependencies MOCKED (no real instances)
Tokens: MOCKED
Properties: MOCKED
Everything: MOCKED
```

**Resolver Options**:
```typescript
{
  mode: null,
  boundaryClasses: [],
  failFastEnabled: false,  // No fail-fast - all mocked anyway
  autoExposeEnabled: false
}
```

---

## Validation & Error Handling

### 1. Mutual Exclusion Enforcement
**Location**: SociableTestBedBuilder (lines 85-100, 127-141)

```typescript
// Prevents mixing modes
if (this.mode === 'boundaries') {
  throw new Error('Cannot use .expose() after .boundaries()...');
}
```

---

### 2. Fail-Fast Errors (v4.0.0)
**Default**: ENABLED
**Location**: DependencyResolver (lines 118-129)

```typescript
if (this.options.failFastEnabled) {
  throw new DependencyNotConfiguredError(name, mode, ...);
}
```

**Error Contains**:
- Dependency name
- Current mode (expose/boundaries/null)
- All configured exposes
- All configured boundaries

**Message Generation**: SociableTestBedBuilder.formatDependencyNotConfiguredError() (lines 287-325)

---

### 3. Unreachable Configuration Warnings
**Location**: SociableTestBedBuilder (lines 240-262)

**Types**:
- Unreachable Mock Configuration (lines 240-248)
  - Mock configured but dependency not in resolution graph
  - Suggests checking if mock is actually needed

- Unreachable Exposed Dependency (lines 251-261)
  - Dependency exposed but not in resolution graph
  - Suggests removing unnecessary exposure

---

### 4. Reference Access Validation (UnitReference)
**Location**: packages/core/src/services/unit-reference.ts (lines 80-141)

**Checks**:
1. Is dependency faked? → Error
2. Is dependency exposed? → Error
3. Does dependency exist? → Error
4. Return mock

---

## Type System Validation

### Mode Progression via Interfaces

**Initial State**:
```typescript
interface SociableTestBedBuilder<TClass> {
  expose(dependency: Type): SociableTestBedBuilderInExposeMode<TClass>;
  boundaries(dependencies: Type[]): SociableTestBedBuilderInBoundariesMode<TClass>;
  disableFailFast(): SociableTestBedBuilder<TClass>;
  compile(): Promise<UnitTestBed<TClass>>;
}
```

**After expose()**:
```typescript
interface SociableTestBedBuilderInExposeMode<TClass> {
  expose(dependency: Type): SociableTestBedBuilderInExposeMode<TClass>;
  disableFailFast(): SociableTestBedBuilderInExposeMode<TClass>;
  compile(): Promise<UnitTestBed<TClass>>;
  // boundaries() NOT available!
}
```

**After boundaries()**:
```typescript
interface SociableTestBedBuilderInBoundariesMode<TClass> {
  boundaries(dependencies: Type[]): SociableTestBedBuilderInBoundariesMode<TClass>;
  disableFailFast(): SociableTestBedBuilderInBoundariesMode<TClass>;
  compile(): Promise<UnitTestBed<TClass>>;
  // expose() NOT available!
}
```

---

## Package Resolver (Adapter Loading)

### Location
`packages/unit/src/package-resolver.ts`

### Purpose
Dynamic loading of DI and mocking library adapters

### Process** (lines 7-27):
1. Get list of available adapters (NestJS, Inversify, Tsyringe, Jest, Sinon, Vitest, etc.)
2. Find which one is installed (via require.resolve)
3. Dynamic import of adapter module
4. Extract adapter export from module
5. Return adapter promise

### Error Handling
- Adapter not found: AdapterNotFoundError (testbed-builder.ts lines 83-87)
- User gets helpful message to install correct adapter

---

## Testbed Builder Factory (packages/unit/src/testbed-builder.ts)

### Purpose
Orchestrates adapter resolution and builder creation

### Process** (lines 71-110):
1. Create DI adapter package resolver
2. Create Doubles (mocking) adapter package resolver
3. Load adapters asynchronously
4. Create UnitMocker with adapter promises
5. Create appropriate builder (Solitary or Sociable)
6. Return builder instance

### Adapter Registries
```typescript
export const SuitesDIAdapters = {
  nestjs: '@suites/di.nestjs',
  inversify: '@suites/di.inversify',
  tsyringe: '@suites/di.tsyringe',
}

export const SuitesDoublesAdapters = {
  jest: '@suites/doubles.jest',
  sinon: '@suites/doubles.sinon',
  vitest: '@suites/doubles.vitest',
  bun: '@suites/doubles.bun',
  deno: '@suites/doubles.deno',
  node: '@suites/doubles.node',
}
```

---

## Key Design Patterns

### 1. Builder Pattern
- TestBedBuilder as abstract base
- Concrete builders: SolitaryTestBedBuilder, SociableTestBedBuilder
- Fluent API: `.mock(...).impl(...).mock(...).final(...).compile()`

### 2. Factory Pattern
- testBedBuilderFactory: Creates builders with adapter resolution
- PackageResolver: Dynamically loads adapters

### 3. Strategy Pattern
- DependencyResolver: Resolution strategy based on options
- Mode-specific behavior: expose vs. boundaries vs. solitary

### 4. Type-State Pattern
- Interfaces enforce mode progression
- Cannot use expose() after boundaries()
- Type system prevents invalid state transitions

### 5. Priority-Based Resolution
- 9-level resolution hierarchy in DependencyResolver
- Each level checked in strict order
- First match wins, cached for consistency

### 6. Immutable Configuration
- ResolverOptions never mutated
- All decisions based on initial config
- Pure functions where possible

---

## Error Types

### DependencyNotConfiguredError
**Purpose**: Fail-fast enabled and dependency not configured
**Contains**: Identifier, mode, configured exposes/boundaries
**Location**: DependencyResolver line 123

### DependencyResolutionError
**Purpose**: Cannot access exposed/faked/missing dependency via unitRef.get()
**Location**: UnitReference.get() method

### AdapterNotFoundError
**Purpose**: Required DI or mocking adapter not installed
**Location**: TestBedBuilder.testBedBuilderFactory

---

## File Reference Summary

| File | Purpose | Lines |
|------|---------|-------|
| /core/src/services/dependency-resolver.ts | Core resolution logic, 9-level priority | 222 |
| /core/src/services/builders/sociable-unit-builder.ts | Sociable mode builder | 327 |
| /core/src/services/builders/testbed-builder.ts | Abstract builder base | 315 |
| /core/src/services/unit-mocker.ts | Orchestrator | 84 |
| /core/src/services/dependency-container.ts | Mock storage | 73 |
| /core/src/services/unit-reference.ts | Mock access validation | 143 |
| /core/src/services/dependency-map.ts | Resolution cache | 35 |
| /core/src/errors/dependency-not-configured.error.ts | Fail-fast error | 25 |
| /core/src/services/builders/solitary-unit-builder.ts | Solitary mode builder | 71 |
| /core/src/normalize-identifier.static.ts | Identifier normalization | 13 |
| /core/src/services/functions.static.ts | Error message utilities | 29 |
| /unit/src/testbed-builder.ts | Adapter resolution factory | 111 |
| /unit/src/testbed.ts | Public TestBed API | 84 |
| /unit/src/package-resolver.ts | Dynamic adapter loading | 38 |

---

## v4.0.0 Key Changes

### Fail-Fast Enabled by Default
- v3.x: Fail-fast disabled, unconfigured deps returned undefined
- v4.0.0: Fail-fast enabled, throws DependencyNotConfiguredError
- Migration: Use `.disableFailFast()` for gradual migration
- Deprecation: Will be removed in v5.0.0

### Better Error Messages
- Single source of truth: SociableTestBedBuilder.formatDependencyNotConfiguredError()
- Mode-aware suggestions
- Actionable guidance for fixing

### Boundaries Mode Support
- New testing strategy for integration tests
- Blacklist mocking instead of whitelist
- Auto-expose for non-boundary dependencies

### Auto-Exposed Classes Tracking
- Boundaries mode tracks which classes were auto-exposed
- Prevents false unreachable warnings
- Included in unitRef access restrictions

