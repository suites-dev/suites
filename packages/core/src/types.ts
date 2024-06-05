import type { UnitReference } from './services/unit-reference';
import type { ConstantValue, DeepPartial, Type } from '@suites/types.common';
import type { IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';
import type { IdentifierToDependency } from './services/dependency-container';
import { normalizeIdentifier } from './normalize-identifier.static';
import type { StubbedInstance } from '@suites/types.doubles';

export interface UnitTestBed<TClass> {
  unit: TClass;
  unitRef: UnitReference;
}

export interface MockOverride<TDependency, TClass> {
  using(value: TDependency & ConstantValue): TestBedBuilder<TClass>;
  using(mockImplementation: DeepPartial<TDependency>): TestBedBuilder<TClass>;
}

export abstract class TestBedBuilder<TClass> implements TestBedBuilder<TClass> {
  protected readonly identifiersToBeMocked: IdentifierToDependency[] = [];

  public mock<TDependency>(type: Type<TDependency>): MockOverride<TDependency, TClass>;
  public mock<TDependency>(
    type: Type<TDependency>,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  public mock<TDependency>(token: string): MockOverride<TDependency, TClass>;
  public mock<TDependency>(
    token: string,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  public mock<TDependency>(token: symbol): MockOverride<TDependency, TClass>;
  public mock<TDependency>(
    token: symbol,
    identifierMetadata: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  public mock<TDependency>(
    identifier: Type<TDependency> | string | symbol,
    identifierMetadata?: IdentifierMetadata
  ): MockOverride<TDependency, TClass>;
  public mock<TDependency>(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): MockOverride<TDependency, TClass> {
    return {
      using: (
        mockImplementationOrValue: DeepPartial<TDependency> | ConstantValue
      ): TestBedBuilder<TClass> => {
        this.identifiersToBeMocked.push([
          normalizeIdentifier(identifier, metadata as never),
          mockImplementationOrValue as StubbedInstance<TDependency> | ConstantValue,
        ]);

        return this;
      },
    };
  }

  public abstract compile(): Promise<UnitTestBed<TClass>>;
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
}
