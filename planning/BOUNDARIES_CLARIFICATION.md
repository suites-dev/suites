# Boundaries Clarification: The Real Meaning in Suites

## 🔥 CRITICAL INSIGHT FOR ALL READERS

### The Most Important Thing to Understand

**BOUNDARIES IS NOT FOR I/O ISOLATION!**

I/O is **ALREADY isolated** because I/O systems use token injection:
- `@Inject('PRISMA')` → Always auto-mocked (token = natural wall)
- `@Inject('DATABASE')` → Always auto-mocked (token = natural wall)
- `@Inject('HTTP_CLIENT')` → Always auto-mocked (token = natural wall)

**Boundaries is for mocking EXPENSIVE/EXTERNAL CLASS dependencies:**
- ML/AI services (heavy computation)
- Recommendation engines
- Complex calculation services
- Third-party SDK classes (when NOT injected via tokens)

### CODE PROOF (dependency-resolver.ts:93-103)
```typescript
// Priority 3: Tokens ALWAYS mocked BEFORE boundaries check
if (this.isLeafOrPrimitive(identifier)) {  // typeof !== 'function' = token
  const mock = this.mockFunction();
  return mock;  // ← Tokens mocked here, boundaries never checked!
}

// Priority 2: Boundaries only for classes
if (this.options.mode === 'boundaries' &&
    typeof identifier === 'function') {  // ← Only classes can be boundaries
  // ...
}
```

Tokens are checked FIRST (Priority 3), boundaries SECOND (Priority 2).
**Tokens bypass boundaries check entirely!**

## Critical Correction

**PREVIOUS MISUNDERSTANDING**: "Boundaries" referred to I/O systems like databases, HTTP clients, message queues.

**ACTUAL REALITY**: In Suites, **token-based injections automatically create "walls" in the dependency graph**. These are ALWAYS mocked because Suites cannot traverse past them—they're not class constructors.

**`.boundaries()` API is for declaring CLASS dependencies as boundaries**, not tokens.

## What Creates a "Wall" (Boundary)?

### Code Validation from `dependency-resolver.ts`

```typescript
// Line 24-28
public isLeafOrPrimitive(identifier: InjectableIdentifier): boolean {
  return (
    typeof identifier !== 'function' ||  // ← THIS IS THE KEY
    this.adapter.inspect(identifier as Type).list().length === 0
  );
}
```

**Key Insight**: `InjectableIdentifier = Type<TClass> | string | symbol` (from `types/di/src/index.ts:28`)

When `typeof identifier !== 'function'`, it means:
- It's a **string token** (e.g., `'LOGGER'`, `'PRISMA_CLIENT'`)
- It's a **symbol token** (e.g., `Symbol.for('CONFIG')`)
- **Suites CANNOT traverse into it** because there's no class constructor to inspect

### Real-World Example from E2E Tests

From `e2e/jest/nestjs/e2e-assets.ts:68-81`:

```typescript
@Injectable()
export class NestJSTestClass {
  public constructor(
    @Inject('LOGGER') private readonly logger: Logger,              // ← WALL (string token)
    @Inject('UNDEFINED') private readonly undefinedParam: undefined, // ← WALL (string token)
    @Inject(Foo) private readonly fooRepository: Repository<Foo>,    // ← WALL (class used as token)
    private readonly testClassTwo: TestClassTwo,                     // ✅ Can traverse (direct class)
    @Inject('CONSTANT_VALUE') private readonly primitiveValue: string, // ← WALL (string token)
    private readonly testClassOne: TestClassOne,                     // ✅ Can traverse (direct class)
    @Inject(SymbolToken) private readonly symbolToken: TestClassFive, // ← WALL (symbol token)
  ) {}
}
```

**What Suites can do**:
- ✅ `testClassTwo: TestClassTwo` → Can instantiate TestClassTwo and traverse its dependencies
- ✅ `testClassOne: TestClassOne` → Can instantiate TestClassOne and traverse its dependencies

**What creates walls** (must be mocked):
- ❌ `@Inject('LOGGER')` → String token, can't traverse beyond this point
- ❌ `@Inject(Foo)` → Class used as token (not direct injection), can't traverse
- ❌ `@Inject(SymbolToken)` → Symbol token, can't traverse beyond this point

## Why This Happens: Dependency Graph Traversal

### The Flow in `dependency-resolver.ts`

```typescript
// Line 72-86: instantiateClass()
public instantiateClass(type: Type, metadata?: IdentifierMetadata) {
  const injectableRegistry = this.adapter.inspect(type); // ← Gets all dependencies

  injectableRegistry.list().forEach((injectable: ClassInjectable) => {
    if (typeof injectable.identifier === 'function') {
      this.availableClassesToExpose.add(injectable.identifier);
    }
    // ← If identifier is string/symbol, it's NOT added to availableClassesToExpose
  });

  const ctorParams = ctorInjectables.map(({ identifier, metadata }) => {
    return this.resolveOrMock(identifier, metadata); // ← Will mock if not a function
  });
}
```

**Key Point**: When `identifier` is a string or symbol:
1. It's NOT a function, so `typeof injectable.identifier === 'function'` is false
2. It's NOT added to `availableClassesToExpose`
3. In `resolveOrMock()`, it hits the `isLeafOrPrimitive()` check
4. **Result: Gets mocked automatically** (line 55-57)

## Sociable Unit Tests vs Integration Tests

### Critical Distinction

**Suites considers sociable tests as UNIT TESTS, not integration tests.**

This means:
- **I/O will NEVER be reachable** in the dependency graph
- **I/O is injected via tokens** like `@Inject('PRISMA_CLIENT')` or `@Inject('HTTP_CLIENT')`
- **These tokens create automatic "walls"** that stop graph traversal
- **Walls are automatically mocked** - no need to declare them as boundaries

### Example: Why PrismaService is a Wall

```typescript
// Common NestJS pattern
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();
  }
}

// In another service
@Injectable()
export class UserRepository {
  constructor(
    @Inject('PRISMA') private readonly prisma: PrismaService // ← WALL (token injection)
    // OR
    private readonly prisma: PrismaService // ← CAN TRAVERSE (direct injection)
  ) {}
}
```

**With token injection** (`@Inject('PRISMA')`):
- Suites sees string token `'PRISMA'`, can't traverse
- Automatically mocked
- This IS the boundary - graph traversal stops here

**With direct class injection** (no `@Inject` decorator):
- Suites sees `PrismaService` class constructor
- CAN instantiate and traverse into `PrismaService`
- Will try to instantiate `PrismaClient` via `super()`
- **This is where problems occur** - trying to reach actual I/O

## What Suites CANNOT Control: Direct Imports

### The Danger Zone

From your reference to docs about spies, the issue is:

```typescript
// service.ts
import { helper } from './helper'; // ← Direct import, not injected

@Injectable()
export class MyService {
  doWork() {
    return helper.calculate(); // ← Suites has NO control over this
  }
}
```

**Why Suites can't help**:
1. `helper` is imported directly, not via DI
2. Suites builds the dependency graph via DI inspection
3. Direct imports are invisible to the DI system
4. **You need spies on the imported module** to control behavior

**Solution**: Use test doubles/spies:
```typescript
// my-service.test.ts
import * as helperModule from './helper';
jest.spyOn(helperModule, 'calculate').mockReturnValue(42);

const { unit } = await TestBed.solitary(MyService).compile();
// Now unit.doWork() will use the mocked helper.calculate()
```

This is why the docs emphasize spies - they're for code that bypasses DI.

## What "Boundaries" Should Actually Mean in v4.1.0

### Original Incorrect Concept

I thought `.boundaries()` would be for declaring I/O systems to mock:
```typescript
// WRONG MENTAL MODEL
TestBed.sociable(UserService)
  .exposeAll()
  .boundaries([PrismaService, HttpClient]) // "These are I/O, mock them"
  .compile();
```

### Corrected Concept

Boundaries in v4.1.0 should mean: **"These are classes in the graph that should be mocked despite being reachable"**

```typescript
// CORRECT USAGE
TestBed.sociable(UserService)
  .expose(AuthService)
  .expose(EmailValidator)
  .boundaries([NotificationService]) // "Stop graph traversal here, mock this"
  .compile();
```

**Semantic meaning**:
- `expose()` → "Make this real and traverse into it"
- `boundaries()` → "Stop traversal here, even though it's reachable. Mock it."
- Token injections → Automatically walls (no declaration needed)

### Why You'd Use `.boundaries()`

```typescript
class UserService {
  constructor(
    private auth: AuthService,
    private email: EmailService,
    private notification: NotificationService // ← Heavy, slow, or unstable
  ) {}
}

class AuthService {
  constructor(
    private token: TokenValidator,
    private cache: CacheService // ← Expensive, you want to stop here
  ) {}
}

// Test setup
TestBed.sociable(UserService)
  .exposeAll()
  .boundaries([NotificationService, CacheService])
  .compile();

// Result:
// ✅ AuthService → Real
// ✅ EmailService → Real
// ✅ TokenValidator → Real
// ❌ NotificationService → Mocked (boundary)
// ❌ CacheService → Mocked (boundary)
```

**Use cases for `.boundaries()`**:
1. **Performance**: Stop traversal at expensive-to-instantiate services
2. **Stability**: Stop at flaky or non-deterministic services
3. **Test Scope**: Limit the blast radius of your unit test
4. **Third-party**: Stop at services that interact with external systems

## Token Injections: Automatic Boundaries

### These DON'T need `.boundaries()` declaration:

```typescript
class MyService {
  constructor(
    @Inject('CONFIG') private config: ConfigType,
    @Inject('LOGGER') private logger: Logger,
    @Inject(PRISMA_TOKEN) private prisma: PrismaClient,
  ) {}
}

// No need to declare these as boundaries - they're automatic walls
TestBed.sociable(MyService)
  .exposeAll()
  .compile();

// All token injections are auto-mocked:
// ✅ 'CONFIG' → Mocked (automatic wall)
// ✅ 'LOGGER' → Mocked (automatic wall)
// ✅ PRISMA_TOKEN → Mocked (automatic wall)
```

## Real Meaning of "Boundaries" in Suites Context

### Two Types of Boundaries:

1. **Natural Boundaries** (Automatic):
   - Token-based injections (`@Inject('TOKEN')`)
   - Symbol-based injections (`@Inject(SYMBOL)`)
   - These create walls in the dependency graph
   - **No declaration needed** - Suites handles automatically

2. **Declared Boundaries** (Manual via `.boundaries()`):
   - Classes you want to mock despite being reachable
   - Used to limit test scope
   - Used for performance/stability
   - **Requires explicit declaration** in v4.1.0 API

## How This Affects v4.1.0 API Design

### What Changes:

#### 1. `.boundaries()` semantics

**Before (incorrect understanding)**:
```typescript
.boundaries([PrismaService, HttpClient]) // "These are I/O systems"
```

**After (correct understanding)**:
```typescript
.boundaries([ExpensiveService, FlakeyService]) // "Stop graph traversal here"
```

#### 2. No need to declare token injections

Token injections are **already boundaries** by nature. Users don't need to declare them.

#### 3. Focus on graph traversal control

The API should emphasize controlling how far Suites traverses:

```typescript
// Partial mode: Manual control over what to traverse into
TestBed.sociable(UserService)
  .expose(AuthService)        // Traverse into AuthService
  .expose(TokenValidator)     // Traverse into TokenValidator
  .boundaries([CacheService]) // Stop at CacheService (don't traverse)
  .compile();

// All mode: Traverse everything except declared boundaries
TestBed.sociable(UserService)
  .exposeAll()
  .boundaries([CacheService, NotificationService]) // Stop traversal here
  .compile();
```

## Fail-Fast with Corrected Understanding

### Partial Mode Fail-Fast

```typescript
TestBed.sociable(UserService)
  .mode('partial')
  .expose(AuthService)
  .boundaries([CacheService])
  .compile();

// When accessing EmailService (not exposed, not boundary, not token):
// ❌ FAIL FAST: "EmailService accessed but not exposed or declared as boundary"

// When accessing @Inject('LOGGER') dependency:
// ✅ AUTO-MOCKED: Token injections are natural walls, no fail-fast needed
```

### All Mode Fail-Fast

```typescript
TestBed.sociable(UserService)
  .mode('all')
  .boundaries([CacheService])
  .compile();

// All class-based injections auto-exposed
// Token injections auto-mocked (natural walls)
// Declared boundaries mocked

// Fail-fast only if:
// - Accessing unreachable class (not in dependency tree)
// - Orphan exposure detected
```

## Summary: Key Corrections

| Original Understanding | Corrected Understanding |
|----------------------|------------------------|
| Boundaries = I/O systems (DB, HTTP) | Boundaries = Graph traversal stop points |
| Need to declare token injections as boundaries | Token injections are natural walls (auto-mocked) |
| `.boundaries()` for external I/O | `.boundaries()` for reachable classes you want to mock |
| I/O systems are reachable in sociable tests | I/O is NEVER reachable (injected via tokens) |
| Sociable tests might hit I/O | Sociable tests are UNIT TESTS (never hit I/O) |

## Validation from Code

### From `dependency-resolver.ts:24-28`:
```typescript
public isLeafOrPrimitive(identifier: InjectableIdentifier): boolean {
  return (
    typeof identifier !== 'function' ||  // ← Tokens (string/symbol) return true
    this.adapter.inspect(identifier as Type).list().length === 0
  );
}
```

✅ **Confirmed**: String/symbol tokens can't be traversed (no constructor to inspect)

### From `dependency-resolver.ts:46-57`:
```typescript
if (this.isLeafOrPrimitive(identifier)) {
  // ... check if exposed ...

  const mock = this.mockFunction(); // ← Auto-mocked
  this.dependencyMap.set(identifier, mock, metadata as never);
  return mock;
}
```

✅ **Confirmed**: Token injections automatically get mocked

### From `types/di/src/index.ts:28`:
```typescript
export type InjectableIdentifier<TClass = unknown> = Type<TClass> | string | symbol;
```

✅ **Confirmed**: Identifiers can be classes OR tokens (string/symbol)

## Examples of Real Boundaries

### Example 1: Token Injection (Natural Boundary)
```typescript
@Injectable()
class UserService {
  constructor(
    @Inject('PRISMA') private readonly db: PrismaClient, // ← Natural wall
    private readonly auth: AuthService,                   // ← Can traverse
  ) {}
}

TestBed.sociable(UserService)
  .expose(AuthService)
  .compile();

// 'PRISMA' → Auto-mocked (natural boundary)
// AuthService → Real instance
```

### Example 2: Declared Boundary (Stop Traversal)
```typescript
@Injectable()
class UserService {
  constructor(
    private readonly auth: AuthService,
    private readonly cache: CacheService, // ← Reachable but we want to mock it
  ) {}
}

TestBed.sociable(UserService)
  .expose(AuthService)
  .boundaries([CacheService]) // ← Manually declare as boundary
  .compile();

// AuthService → Real instance
// CacheService → Mocked (declared boundary)
```

### Example 3: All Mode with Boundaries
```typescript
@Injectable()
class UserService {
  constructor(
    private readonly auth: AuthService,
    private readonly email: EmailService,
    private readonly notification: NotificationService,
    @Inject('CONFIG') private readonly config: Config,
  ) {}
}

TestBed.sociable(UserService)
  .exposeAll()
  .boundaries([NotificationService])
  .compile();

// AuthService → Real (auto-exposed)
// EmailService → Real (auto-exposed)
// NotificationService → Mocked (declared boundary)
// 'CONFIG' → Mocked (natural boundary)
```

## Impact on Documentation

The documentation should clarify:

1. **Token injections are natural boundaries** - they create "walls" in the dependency graph
2. **I/O never reaches unit tests** - it's injected via tokens which stop traversal
3. **`.boundaries()` is for reachable classes** you want to mock for performance/stability/scope
4. **Spies are for direct imports** that bypass DI entirely
5. **Sociable tests are unit tests**, not integration tests

## Next Steps

1. Update `V4_1_API_DESIGN.md` with corrected boundaries concept
2. Ensure error messages reflect this understanding
3. Update examples to show realistic boundary usage
4. Add documentation about natural vs declared boundaries