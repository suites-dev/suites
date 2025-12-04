import { TestBed } from '@suites/unit';
import { NestJSTestClass, SymbolToken } from './e2e-assets.js';

describe('NestJS DI Adapter Type Safety', () => {
  it('allows mocking without metadata', async () => {
    const { unitRef } = await TestBed.solitary(NestJSTestClass)
      .mock<string>('CONSTANT_VALUE')
      .final('test-value')
      .compile();

    expect(unitRef).toBeDefined();
  });
});

// Type-only tests - these verify compile-time type checking
// The @ts-expect-error ensures these would fail at compile time without the annotation
function typeOnlyTests() {
  TestBed.solitary(NestJSTestClass).mock<string>('CONSTANT_VALUE', { some: 'metadata' });

  TestBed.solitary(NestJSTestClass).mock<string>(SymbolToken, { name: 'target' });
}
