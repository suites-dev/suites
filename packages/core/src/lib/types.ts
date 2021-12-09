import { MockPartialImplementation } from '@automock/common';
import { MockResolver } from './mock-resolver';
import { SpecBuilder } from './spec-builder-abstract';

export interface Override<Partial, TClass> {
  using: (mockImplementation: MockPartialImplementation<Partial>) => SpecBuilder<TClass>;
}

export interface TestingUnit<TClass = any> {
  unit: TClass;
  unitRef: MockResolver;
}
