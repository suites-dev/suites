import { MockPartialImplementation } from '@automock/common';
import { MockResolver } from './mock-resolver';
import { UnitBuilderr } from './unit-builder-abstract';

export interface Override<Partial, TClass> {
  using: (mockImplementation: MockPartialImplementation<Partial>) => UnitBuilderr<TClass>;
}

export interface TestingUnit<TClass = any> {
  unit: TClass;
  unitRef: MockResolver;
}
