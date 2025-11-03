# Migrating to Suites v4.0.0

## Overview

Suites v4.0.0 introduces fail-fast behavior by default and the new boundaries API. This guide helps you migrate your existing tests.

## Breaking Changes

### 1. Fail-Fast is ON by Default

**Impact**: Tests that relied on silent `undefined` returns will now throw errors.

**Before** (v3.x):
```typescript
// Non-configured dependencies returned undefined
const { unit } = await TestBed.sociable(UserService)
  .expose(AuthService)
  .compile();

// DatabaseService not configured - returns undefined
await unit.saveUser(user); // Silently fails, test passes
```

**After** (v4.0):
```typescript
// Same test now throws error
const { unit } = await TestBed.sociable(UserService)
  .expose(AuthService)
  .compile();

// ❌ Error: Dependency 'DatabaseService' was not configured
await unit.saveUser(user);
```

### 2. Type Signature Change

The `TestBed.sociable()` method now returns the full builder immediately.

**Before** (v3.x):
```typescript
// Had to call .expose() first
TestBed.sociable(Service): Pick<Builder, 'expose'>
```

**After** (v4.0):
```typescript
// All methods available immediately
TestBed.sociable(Service): SociableTestBedBuilder
```

## Migration Strategies

### Strategy 1: Quick Fix (Not Recommended)

Add `.disableFailFast()` to restore v3.x behavior temporarily:

```typescript
const { unit } = await TestBed.sociable(UserService)
  .expose(AuthService)
  .disableFailFast() // ⚠️ Temporary fix
  .compile();
```

**Warning**: This defeats the purpose of v4.0. Use only as a temporary measure.

### Strategy 2: Fix Your Tests (Recommended)

Configure all dependencies explicitly:

```typescript
const { unit } = await TestBed.sociable(UserService)
  .expose(AuthService)
  .expose(UserDal)
  .mock(DatabaseService).impl(() => ({
    save: jest.fn()
  }))
  .mock(EmailService).impl(() => ({
    send: jest.fn()
  }))
  .compile();
```

### Strategy 3: Switch to Boundaries (Best for Most Cases)

If you're exposing many dependencies, boundaries is simpler:

```typescript
// Before: Tedious expose list
const { unit } = await TestBed.sociable(UserService)
  .expose(AuthService)
  .expose(UserDal)
  .expose(ValidationService)
  .expose(CacheService)
  .expose(ConfigService)
  // ... many more
  .compile();

// After: Simple boundaries
const { unit } = await TestBed.sociable(UserService)
  .boundaries([DatabaseService, HttpClient]) // Just mock I/O
  .compile();
```

## Common Migration Scenarios

### Scenario 1: Simple Service Test

**v3.x Test**:
```typescript
it('should process order', async () => {
  const { unit, unitRef } = await TestBed.sociable(OrderService)
    .expose(PricingService)
    .compile();

  const mockPayment = unitRef.get(PaymentService);
  mockPayment.charge = jest.fn().mockResolvedValue({ id: '123' });

  const result = await unit.processOrder(100);
  expect(result.id).toBe('123');
});
```

**v4.0 Option 1 - Fix with explicit configuration**:
```typescript
it('should process order', async () => {
  const { unit, unitRef } = await TestBed.sociable(OrderService)
    .expose(PricingService)
    .mock(PaymentService).impl((stub) => ({
      charge: stub().mockResolvedValue({ id: '123' })
    }))
    .mock(EmailService).impl(() => ({})) // Configure all deps
    .compile();

  const result = await unit.processOrder(100);
  expect(result.id).toBe('123');
});
```

**v4.0 Option 2 - Switch to boundaries**:
```typescript
it('should process order', async () => {
  const { unit, unitRef } = await TestBed.sociable(OrderService)
    .boundaries([PaymentService, EmailService]) // Mock only I/O
    .compile();

  const mockPayment = unitRef.get(PaymentService);
  mockPayment.charge = jest.fn().mockResolvedValue({ id: '123' });

  const result = await unit.processOrder(100);
  expect(result.id).toBe('123');
});
```

### Scenario 2: Complex Integration Test

**v3.x Test with many exposes**:
```typescript
const { unit } = await TestBed.sociable(CheckoutService)
  .expose(OrderService)
  .expose(InventoryService)
  .expose(PricingService)
  .expose(TaxService)
  .expose(ValidationService)
  .expose(UserService)
  .expose(ProductService)
  .expose(CouponService)
  .mock(PaymentGateway).impl(mockPayment)
  .mock(EmailSender).impl(mockEmail)
  .compile();
```

**v4.0 with boundaries (much simpler)**:
```typescript
const { unit } = await TestBed.sociable(CheckoutService)
  .boundaries([PaymentGateway, EmailSender]) // Only mock external services
  .compile();
```

### Scenario 3: Tests That Were Already Broken

Some v3.x tests were passing incorrectly. v4.0 will expose these:

**v3.x "Lying Test"**:
```typescript
it('should save user', async () => {
  const { unit } = await TestBed.sociable(UserService)
    .expose(ValidationService)
    .compile();

  // This test passes but doesn't actually save!
  // DatabaseService.save() returns undefined
  await unit.createUser({ name: 'John' });

  // ❌ Test passes but user was never saved!
});
```

**v4.0 forces you to fix it**:
```typescript
it('should save user', async () => {
  const { unit, unitRef } = await TestBed.sociable(UserService)
    .expose(ValidationService)
    .mock(DatabaseService).impl((stub) => ({
      save: stub().mockResolvedValue(true)
    }))
    .compile();

  await unit.createUser({ name: 'John' });

  // ✅ Now we're actually testing the save behavior
  const mockDb = unitRef.get(DatabaseService);
  expect(mockDb.save).toHaveBeenCalled();
});
```

## Step-by-Step Migration Process

### Step 1: Identify Affected Tests

Run your test suite with v4.0:
```bash
npm test
```

Tests that fail with "not configured" errors need migration.

### Step 2: Categorize Your Tests

For each failing test, decide:
1. **Few dependencies** → Fix with explicit configuration
2. **Many dependencies** → Switch to boundaries
3. **Temporary skip** → Add `.disableFailFast()` (mark for later)

### Step 3: Migrate Gradually

1. Start with high-value tests
2. Add `.disableFailFast()` to low-priority tests
3. Create tickets to fix disabled tests
4. Remove all `.disableFailFast()` before v5.0

### Step 4: Update Team Practices

Train your team on:
- When to use boundaries vs expose
- Why fail-fast prevents bugs
- How to write explicit test configuration

## Troubleshooting

### Error: "Cannot use .boundaries() after .expose()"

You're mixing modes. Choose one:
- Use `.expose()` for fine-grained control
- Use `.boundaries()` for simpler configuration

### Error: "Dependency 'X' was not configured"

Options:
1. Add to `.expose()` to make it real
2. Add to `.boundaries()` to mock it
3. Use `.mock()` for custom behavior
4. Use `.disableFailFast()` temporarily (not recommended)

### Tests Much Slower After Migration

If you switched many mocks to real with boundaries:
- Consider if you need that many real dependencies
- Add more services to boundaries if they're expensive
- Use `.mock()` for slow services

## Best Practices Going Forward

### Use Boundaries for I/O

```typescript
.boundaries([
  DatabaseService,
  HttpClient,
  FileSystem,
  MessageQueue
])
```

### Use Expose for Specific Collaboration

```typescript
.expose(PartnerService) // Test specific interaction
.mock(Everything).impl(...) // Mock the rest
```

### Always Configure All Dependencies

Never rely on undefined behavior:
```typescript
// Bad: Unclear what happens with unconfigured deps
.expose(ServiceA)

// Good: Explicit about all deps
.expose(ServiceA)
.mock(ServiceB).impl(...)
.mock(ServiceC).impl(...)
```

## Getting Help

- **Documentation**: https://suites.dev/docs/v4-migration
- **GitHub Discussions**: https://github.com/suites-dev/suites/discussions
- **Migration Examples**: See `/examples/migration` in the repo

## Timeline

- **v4.0.0**: Released with `.disableFailFast()`
- **v4.x**: Deprecation warnings increase
- **v5.0.0**: `.disableFailFast()` removed

Start migrating now to avoid issues in v5.0!