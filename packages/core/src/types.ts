import { UnitReference } from './services/unit-reference';
import { ConstantValue, DeepPartial, Type } from '@suites/types.common';
import { IdentifierMetadata } from '@suites/types.di';

export interface UnitTestBed<TClass> {
  unit: TClass;
  unitRef: UnitReference;
}

export interface MockOverride<TDependency, TClass> {
  using(value: TDependency & ConstantValue): TestBedBuilder<TClass>;
  using(mockImplementation: DeepPartial<TDependency>): TestBedBuilder<TClass>;
}

export interface TestBedBuilder<TClass> {
  mock<TDependency>(type: Type<TDependency>): MockOverride<TDependency, TClass>;
  mock<TDependency>(
    type: Type<TDependency>,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  mock<TDependency>(token: string): MockOverride<TDependency, TClass>;
  mock<TDependency>(
    token: string,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  mock<TDependency>(token: symbol): MockOverride<TDependency, TClass>;
  mock<TDependency>(
    token: symbol,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  mock<TDependency>(
    identifier: Type<TDependency> | string | symbol,
    identifierMetadata?: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  compile(): Promise<UnitTestBed<TClass>>;
}
