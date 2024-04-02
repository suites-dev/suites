import { IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';
import { ConstantValue, Type } from '@suites/types.common';
import { StubbedInstance } from '@suites/types.doubles';
import { IdentifierToDependency } from './dependency-container';

export class DependencyMap {
  private readonly resolvedDependencies: IdentifierToDependency[] = [];

  public has(identifier: InjectableIdentifier): boolean {
    return this.resolvedDependencies.some(([{ identifier: resolvedId }]) => {
      return identifier === resolvedId;
    });
  }

  public set(
    identifier: InjectableIdentifier,
    value: Type | StubbedInstance<unknown> | ConstantValue,
    metadata?: IdentifierMetadata
  ): void {
    this.resolvedDependencies.push([{ identifier, metadata: metadata as never }, value]);
  }

  public get(
    identifier: InjectableIdentifier
  ): Type | StubbedInstance<unknown> | ConstantValue | undefined {
    return this.resolvedDependencies.find(([{ identifier: resolvedId }]) => {
      return identifier === resolvedId;
    })?.[1];
  }

  public entries(): IdentifierToDependency[] {
    return this.resolvedDependencies;
  }
}
