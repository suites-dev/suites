# v4.0.0 Executive Summary

**Purpose**: Final design decisions for Suites v4.0.0

---

## The Core Problem

**"Lying Tests"** - Tests pass incorrectly because non-exposed dependencies return `undefined` silently.

**Origin**: Production user (QozbroQqn) from large NestJS app (80+ modules, 500+ files, 1000+ tests) reported in [GitHub Discussion #655](https://github.com/suites-dev/suites/discussions/655).

**Their workflow**:
> "Sociable tests expose all dependencies including dependencies of dependencies (except PrismaService or similar external APIs)"

---

## The Solution: Auto-Expose with Boundaries

### Single New Feature

Add `.boundaries([...])` method that:
1. Mocks the specified dependencies
2. Auto-exposes everything else

```typescript
// Simple, solves the problem
TestBed.sociable(UserService)
  .boundaries([PrismaService, HttpClient])
  .compile();

// Result:
// - All class dependencies → Real (auto-exposed) ✅
// - Token injections → Auto-mocked (automatic) ✅
// - PrismaService, HttpClient → Mocked (boundaries) ✅
```

---

## Critical Technical Insight

**Token injections are automatically mocked** (no declaration needed):

```typescript
@Inject('PRISMA') private db: PrismaClient  // ← Auto-mocked ✅
@Inject('LOGGER') private logger: Logger    // ← Auto-mocked ✅

// From dependency-resolver.ts:24-28:
public isLeafOrPrimitive(identifier: InjectableIdentifier): boolean {
  return typeof identifier !== 'function' ||  // ← Tokens stop here
         this.adapter.inspect(identifier as Type).list().length === 0;
}
```

**This is why sociable tests are UNIT tests** - I/O never reached (injected via tokens).

---

## Design Decisions

### ✅ What We're Doing

1. **Add `.boundaries()` method** - Auto-exposes everything except boundaries
2. **Relax type constraints** - Allow `.boundaries()` as first call
3. **Keep backwards compatibility** - All existing APIs work unchanged

### ❌ What We're NOT Doing

1. **NO fail-fast** - Current auto-mocking works fine, user problem solved by auto-expose
2. **NO `.exposeAll()`** - `.boundaries()` already implies auto-expose
3. **NO mode concept** - Behavior naturally determined by which methods called
4. **NO breaking changes** - All v3.x code works identically

---

## API Surface

```typescript
// Existing (unchanged):
.expose(dep)          // Whitelist real dependencies
.mock(dep).impl(...)  // Custom mock behavior
.compile()            // Build test bed

// New:
.boundaries(deps)     // Auto-expose everything except these
```

---

## Examples

### Example 1: Auto-Expose (New Pattern)
```typescript
TestBed.sociable(UserService)
  .boundaries([PrismaService])
  .compile();
// Everything real except PrismaService
```

### Example 2: Backwards Compatible (v3.x)
```typescript
TestBed.sociable(UserService)
  .expose(AuthService)
  .compile();
// Works exactly as before
```

### Example 3: Custom Mock
```typescript
TestBed.sociable(UserService)
  .boundaries([PrismaService])
  .mock(HttpClient).impl(customMock)
  .compile();
```

---

## Implementation

### Changes Required

**File**: `packages/unit/src/testbed.ts`
- Remove `Pick<..., 'expose'>` constraint
- Return full `SociableTestBedBuilder<TClass>`

**File**: `packages/core/src/services/builders/sociable-unit-builder.ts`
- Add `.boundaries()` method
- Add `autoExposeEnabled` flag

**File**: `packages/core/src/services/dependency-resolver.ts`
- Add auto-expose logic when `autoExposeEnabled` true
- Check boundaries before auto-expose

**That's it!** ~50 lines of code.

---

## Timeline

- **Week 1**: Implementation + tests
- **Week 2**: Beta testing with QozbroQqn's team
- **Week 3**: Documentation + stable release

**Total: 3 weeks** (vs original 4-6 weeks)

---

## Success Metrics

- ✅ Zero breaking changes
- ✅ Solves QozbroQqn's "tedious exposure" problem
- ✅ Simple implementation
- ✅ Fast delivery

---

## Key Files

1. **FINAL_V4_DESIGN.md** - Complete design specification
2. **BOUNDARIES_CLARIFICATION.md** - Token injection behavior explanation
3. **AUTO_EXPOSE_FAIL_FAST_DESIGN.md** - Original problem statement from discussion #655
4. **V4_0_0_IMPLEMENTATION_CHECKLIST.md** - Implementation tasks (needs update)
