import 'reflect-metadata';
import { TestBed } from '@suites/unit';
import { InversifyJSTestClass, SymbolToken } from './e2e-assets';

describe('Inversify DI Adapter Type Safety', () => {
  it('allows metadata argument for string tokens', async () => {
    const { unitRef } = await TestBed.solitary(InversifyJSTestClass)
      .mock<string>('BarToken', { name: 'someTarget' })
      .final('value')
      .compile();

    expect(unitRef).toBeDefined();
  });

  it('allows metadata argument for symbol tokens', async () => {
    const { unitRef } = await TestBed.solitary(InversifyJSTestClass)
      .mock<string>(SymbolToken, { inject: 'someIdentifier' })
      .final('value')
      .compile();

    expect(unitRef).toBeDefined();
  });

  it('works without metadata', async () => {
    const { unitRef } = await TestBed.solitary(InversifyJSTestClass)
      .mock<string>('CONSTANT_VALUE')
      .final('value')
      .compile();

    expect(unitRef).toBeDefined();
  });
});