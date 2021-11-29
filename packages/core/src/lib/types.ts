import { BaseUnitBuilder } from '@aromajs/core';
import { MockOf, MockPartialImplementation } from '@aromajs/common';
import { MockResolver } from './mock-resolver';

export interface Override<T> {
  using: (mockImplementation: MockPartialImplementation<T>) => BaseUnitBuilder;
}

export interface TestingUnit<TClass = any> {
  unit: TClass;
  unitRef: MockResolver<MockOf<any>>;
}
