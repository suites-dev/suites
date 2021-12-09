import { ImplementationFunctions } from '@automock/common';
import { MockResolver } from './mock-resolver';
import { SpecBuilder } from './spec-builder-abstract';

export interface TestingUnit<TClass = any> {
  unit: TClass;
  unitRef: MockResolver;
}

export interface Override<Partial> {
  using: (mockImplementation: ImplementationFunctions<Partial>) => SpecBuilder;
}
