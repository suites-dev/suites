import { TestBed } from '@suites/unit';
import { NestJSTestClass } from './e2e-assets';

describe('NestJS DI Adapter Type Safety', () => {
  it('allows mocking without metadata', async () => {
    const { unitRef } = await TestBed.solitary(NestJSTestClass)
      .mock<string>('CONSTANT_VALUE')
      .final('test-value')
      .compile();

    expect(unitRef).toBeDefined();
  });
});
