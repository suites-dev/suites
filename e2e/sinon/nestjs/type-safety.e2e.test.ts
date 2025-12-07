import { TestBed } from '@suites/unit';
import { NestJSTestClass, SymbolToken } from './e2e-assets';
import { expect } from 'chai';

describe('NestJS DI Adapter Type Safety', () => {
  it('allows mocking without metadata', async () => {
    const { unitRef } = await TestBed.solitary(NestJSTestClass)
      .mock<string>('CONSTANT_VALUE')
      .final('test-value')
      .compile();

    expect(unitRef).to.exist;
  });
});
