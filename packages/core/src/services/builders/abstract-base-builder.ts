import { StubbedInstance } from '@suites/types.doubles';
import { IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';
import { ConstantValue, DeepPartial, Type } from '@suites/types.common';
import { BaseTestBedBuilder, MockOverride, UnitTestBed } from '../../types';
import { normalizeIdentifier } from '../../normalize-identifier.static';
import { IdentifierToDependency } from '../dependency-container';

export abstract class TestBedBuilderAbstract<TClass> implements BaseTestBedBuilder<TClass> {
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
      ): BaseTestBedBuilder<TClass> => {
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
