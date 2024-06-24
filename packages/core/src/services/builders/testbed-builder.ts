import type { IdentifierToFinal, IdentifierToMockImplWithCb } from '../dependency-container';
import type { DeepPartial, FinalValue, Type } from '@suites/types.common';
import type { IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';
import { normalizeIdentifier } from '../../normalize-identifier.static';
import type { MockOverride, UnitTestBed } from '../../types';
import type { ArgsType, Stub } from '@suites/types.doubles';

export abstract class TestBedBuilder<TClass> implements TestBedBuilder<TClass> {
  protected readonly identifiersToBeMocked: IdentifierToMockImplWithCb[] = [];
  protected readonly identifiersToBeFinalized: IdentifierToFinal[] = [];

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
      impl: (
        mockImplementation: (
          stubFn: () => Stub<TDependency, ArgsType<TDependency>>
        ) => DeepPartial<TDependency>
      ): TestBedBuilder<TClass> => {
        this.identifiersToBeMocked.push([
          normalizeIdentifier(identifier, metadata as never),
          mockImplementation,
        ]);

        return this;
      },
      final: (finalImplementation: FinalValue<TDependency>): TestBedBuilder<TClass> => {
        this.identifiersToBeFinalized.push([
          normalizeIdentifier(identifier, metadata as never),
          finalImplementation,
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
