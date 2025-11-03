# v4.0.0 Planning Documentation

## 🎯 For AI Agents & Documentation Team

This folder contains the complete design documentation for Suites v4.0.0, serving 500K monthly users.

---

## 📚 Documentation Structure

### Essential Document (Start Here)

**[V4_COMPLETE_KNOWLEDGE_BASE.md](V4_COMPLETE_KNOWLEDGE_BASE.md)** - **READ THIS FIRST**
- Complete reference for everything about TestBed API and v4.0.0
- Critical insights that MUST be understood
- Technical implementation details
- Migration guide
- Design rationale
- This consolidates all knowledge from the planning phase

### Supporting Documents

1. **[BOUNDARIES_CLARIFICATION.md](BOUNDARIES_CLARIFICATION.md)** - **CRITICAL: Why tokens are natural boundaries**
   - Deep dive into why boundaries ≠ I/O isolation
   - Code proof from dependency resolver
   - Natural vs declared boundaries
   - Common misconceptions corrected

2. **[V4_TECHNICAL_SPECIFICATION.md](V4_TECHNICAL_SPECIFICATION.md)** - Implementation specification
   - API signatures
   - Resolution logic
   - Error messages
   - Testing requirements

3. **[V4_DESIGN_RATIONALE.md](V4_DESIGN_RATIONALE.md)** - Philosophy and reasoning
   - Why each decision was made
   - Trade-offs analysis
   - Success metrics
   - Philosophical principles

4. **[MIGRATION_V4.md](MIGRATION_V4.md)** - User migration guide
   - Breaking changes
   - Migration strategies
   - Common scenarios
   - Troubleshooting

---

## 🔥 CRITICAL INSIGHTS

### 1. Tokens Are Natural Boundaries (NOT I/O!)

**CODE PROOF** (`dependency-resolver.ts:46-51, 93-103`):
```typescript
// Priority 3: Tokens ALWAYS mocked BEFORE boundaries check
if (this.isLeafOrPrimitive(identifier)) {  // typeof !== 'function' = token
  const mock = this.mockFunction();
  return mock;
}
```

**What This Means**:
- `@Inject('PRISMA')` → Always mocked (token)
- `@Inject('DATABASE')` → Always mocked (token)
- I/O is ALREADY isolated via tokens!

**Boundaries is NOT for I/O isolation!**

### 2. What Boundaries Is Actually For

Mock **expensive/external CLASS dependencies**:
- ML/AI services (`RecommendationEngine`)
- Heavy computation services
- Third-party SDK wrappers (when classes, not tokens)
- Flaky services

**NOT for I/O** - tokens handle that automatically!

### 3. Fail-Fast Is Critical in Expose Mode

The "lying tests" problem happens in **expose mode** where:
- Non-exposed deps → auto-mocked → return `undefined`
- Tests pass with undefined → bugs reach production

Fail-fast prevents this by throwing instead of returning `undefined`.

---

## The Core Problem & Solution

### Problem (GitHub Discussion #655 + Issue #820)
1. **Tedious configuration**: Users must call `.expose()` dozens of times
2. **Lying tests**: Tests pass when they should fail due to silent `undefined`

### Solution: Two Features
1. **`.boundaries()`** - Inverts mental model, mocks only (expensive/flaky) class boundaries
2. **Fail-fast** - Throws errors instead of returning `undefined`

---

## Key Design Decisions

- **Breaking change accepted**: Fail-fast ON by default for safety
- **Modes are mutually exclusive**: Can't mix `.expose()` and `.boundaries()`
- **Tokens always mocked**: Natural boundaries regardless of mode (Priority 3)
- **Simple API**: Just `.boundaries()` and `.disableFailFast()`
- **Single responsibility**: Error messages only in builder, resolver is pure logic
- **No optionals**: All parameters explicit for clarity

---

## Example: The Transformation

```typescript
// v3.x - Tedious
TestBed.sociable(UserService)
  .expose(ServiceA)
  .expose(ServiceB)
  .expose(ServiceC)
  // ... 20 more lines
  .compile();

// v4.0 - Simple
TestBed.sociable(UserService)
  .boundaries([ExpensiveMLService]) // Just mock expensive classes, NOT I/O!
  .compile();
```

---

## For Documentation Website

Key messages for users:
1. **Boundaries simplify configuration** for large codebases
2. **Fail-fast prevents production bugs** by catching issues in tests
3. **Migration is gradual** with `.disableFailFast()` escape hatch
4. **Mental models are clear** with mutually exclusive modes
5. **Tokens (I/O) are automatically mocked** - no need to declare in boundaries

---

## Technical Implementation

- **~275 lines of code** including tests
- **Non-breaking type changes** (expansion, not restriction)
- **3-week timeline** for implementation
- **Backward compatible** with escape hatches

---

## Success Metrics

With 500K monthly downloads, success means:
- Fewer production bugs (fail-fast)
- Faster test writing (boundaries)
- Clear mental models (mutual exclusivity)
- Smooth migration (escape hatches)

---

## Quick Reference

### Reading Order
1. Start with **V4_COMPLETE_KNOWLEDGE_BASE.md** for complete understanding
2. Read **BOUNDARIES_CLARIFICATION.md** to understand the token/boundary distinction
3. Refer to **V4_TECHNICAL_SPECIFICATION.md** for implementation details
4. Check **V4_DESIGN_RATIONALE.md** to understand the "why"
5. Use **MIGRATION_V4.md** to help users migrate

### For Implementation
- **V4_COMPLETE_KNOWLEDGE_BASE.md** has resolution logic and priority order
- **V4_TECHNICAL_SPECIFICATION.md** has exact API signatures and error messages
- **BOUNDARIES_CLARIFICATION.md** has code proof for token behavior

### For Documentation
- **V4_COMPLETE_KNOWLEDGE_BASE.md** has best practices and examples
- **BOUNDARIES_CLARIFICATION.md** has the critical correction about I/O
- **MIGRATION_V4.md** has user-facing migration scenarios