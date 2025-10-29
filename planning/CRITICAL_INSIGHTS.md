# CRITICAL INSIGHTS - READ THIS FIRST

## For Future AI Agents and Developers

These are the most important insights discovered during v4.0.0 implementation that MUST be understood.

---

## 🔥 Insight #1: Boundaries Is NOT For I/O Isolation

### The Misconception
"Boundaries is for mocking I/O like databases and HTTP clients"

### The Reality
**I/O is ALREADY mocked via token injection!**

```typescript
@Injectable()
class DatabaseService {
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {}
  //           ^^^^^^^^ TOKEN - ALWAYS auto-mocked at Priority 3!
}
```

### Code Proof
From `dependency-resolver.ts`:

**Line 93-103: Priority 3 (Before boundaries check)**
```typescript
if (this.isLeafOrPrimitive(identifier)) {  // typeof !== 'function'
  const mock = this.mockFunction();
  return mock;  // ← Tokens mocked HERE
}
```

**Line 82-91: Priority 2 (Boundaries check)**
```typescript
if (this.options.mode === 'boundaries' &&
    typeof identifier === 'function') {  // ← Only classes
  const mock = this.mockFunction();
  return mock;
}
```

**Tokens are checked FIRST, never reach boundaries check!**

### What Boundaries Is Actually For

Mock **expensive/external CLASS dependencies**:
- ML/AI services (RecommendationEngine)
- Heavy computation (5-second algorithms)
- Third-party SDK classes
- Flaky/non-deterministic services

**Example**:
```typescript
TestBed.sociable(UserService)
  .boundaries([RecommendationEngine]) // Expensive class, not I/O!
  .compile();

// Result:
// - RecommendationEngine → Mocked (expensive, don't want to run)
// - BusinessLogic services → Real (want to test)
// - @Inject('PRISMA') → Auto-mocked (token, natural boundary)
```

---

## 🔥 Insight #2: Fail-Fast Is Critical in EXPOSE Mode

### Why Fail-Fast Matters Most in Expose Mode

In **expose mode**:
- Default: Everything mocked
- Non-exposed deps return `undefined`
- **"Lying tests"** - tests pass with undefined, production fails

In **boundaries mode**:
- Default: Everything real
- Real instantiation fails naturally if deps missing
- Less need for fail-fast (but still valuable for consistency)

### The "Lying Test" Example

```typescript
// WITHOUT fail-fast (v3.x)
TestBed.sociable(PaymentService)
  .expose(Logger)
  .compile();

// DatabaseService not exposed → auto-mocked → returns undefined
await paymentService.charge(100); // undefined.save() = silent failure
// Test passes but payment was never saved! ❌
```

```typescript
// WITH fail-fast (v4.0)
TestBed.sociable(PaymentService)
  .expose(Logger)
  .compile();

// DatabaseService not configured → THROWS immediately ✅
// Bug caught at test time, not production!
```

---

## 🔥 Insight #3: Modes Are Opposite Mental Models (Mutually Exclusive)

### Expose Mode (Whitelist)
- **Default**: Everything MOCKED
- **`.expose()`**: Make these REAL
- **Mental model**: "Start in a sealed box, open specific windows"

### Boundaries Mode (Blacklist)
- **Default**: Everything REAL
- **`.boundaries()`**: Make these MOCKED
- **Mental model**: "Start in an open field, set up walls at edges"

### Why They Can't Mix

```typescript
.boundaries([A]).expose(B)  // ERROR!
// Question: Is C mocked or real by default?
// In boundaries mode: Real
// In expose mode: Mocked
// IMPOSSIBLE TO ANSWER - mental models conflict!
```

**Code enforcement** (`sociable-unit-builder.ts:61-73, 101-115`):
- Calling `.expose()` after `.boundaries()` → throws
- Calling `.boundaries()` after `.expose()` → throws
- Mode is set once, cannot change

---

## 🔥 Insight #4: Single Responsibility for Error Messages

### Architecture Pattern

**WRONG**: Error messages scattered everywhere
```typescript
// In dependency-resolver.ts
throw new Error("Long message with suggestions...") // ❌ Wrong layer!
```

**RIGHT**: Error messages only in builder layer
```typescript
// In dependency-resolver.ts
throw new DependencyNotConfiguredError(name, mode, ...) // ✅ Data only

// In sociable-unit-builder.ts
catch (error) {
  if (error instanceof DependencyNotConfiguredError) {
    throw new Error(this.formatDependencyNotConfiguredError(error));
    // ✅ Message generation in ONE place
  }
}
```

**Why**:
- DependencyResolver is pure logic (testable, reusable)
- Builder is presentation layer (error messages, warnings)
- Single place to maintain user-facing text

---

## 🔥 Insight #5: No Optional Parameters in Critical Paths

### The Problem with Optionals

```typescript
// BAD
constructUnit(target, classes, container, options?: ResolverOptions)
// Caller might forget options, gets unexpected defaults
```

### The Solution

```typescript
// GOOD
constructUnit(target, classes, container, options: ResolverOptions)
// Caller MUST be explicit:
constructUnit(target, [], container, {
  mode: null,
  boundaryClasses: [],
  failFastEnabled: false,  // Clear intent
  autoExposeEnabled: false
})
```

**Why**: With 500K users, explicit is better than convenient.

---

## 🔥 Insight #6: Immutability and No Side Effects

### Every Method is Pure

```typescript
// GOOD: Immutable copy
boundaryClasses: [...this.boundaryClasses]

// GOOD: Never mutate options
this.options = options; // Store, never modify

// GOOD: Pure function
private getModeSpecificMessage(): string {
  // No side effects, just returns string
}
```

**Why**: Precious code for tech companies - predictable, testable, safe.

---

## 🔥 Insight #7: Resolution Priority Order Matters

### The 7 Priorities (dependency-resolver.ts:69-146)

1. **Explicit mocks** - `.mock().impl()` ALWAYS wins
2. **Boundaries** - Class in boundaries array (if boundaries mode)
3. **Tokens** - ALWAYS mocked (natural boundaries)
4. **Auto-expose** - Classes auto-exposed (if boundaries mode)
5. **Explicit expose** - In expose list (if expose mode)
6. **Fail-fast** - Throw error (if enabled)
7. **Auto-mock** - Fallback (backward compat)

**Why this order**:
- Explicit intent (1-2) beats defaults (3-5)
- Tokens (3) checked before mode logic (4-5)
- Fail-fast (6) catches unhandled cases
- Auto-mock (7) for backward compatibility

---

## Summary: What This Means for v4.0.0

1. **Boundaries simplifies configuration** - But for CLASS deps, not I/O
2. **Fail-fast prevents lying tests** - Especially critical in expose mode
3. **Tokens are automatic** - Never need to declare I/O in boundaries
4. **Mental models are clear** - One mode per test, no mixing
5. **Code is enterprise-grade** - Immutable, pure, single responsibility

## For Documentation Writers

When explaining boundaries, emphasize:
- ❌ NOT "mock your database and HTTP"
- ✅ YES "mock expensive computations and external class services"
- ✅ YES "tokens (I/O) are already mocked automatically"
- ✅ YES "boundaries is for test performance and scope control"
