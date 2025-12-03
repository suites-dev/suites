import type { IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';
import type { FinalValue, Type } from '@suites/types.common';
import type { StubbedInstance } from '@suites/types.doubles';
import type { IdentifierToMockOrFinal } from './dependency-container';

export class DependencyMap {
  private readonly resolvedDependencies: IdentifierToMockOrFinal[] = [];

  public has(identifier: InjectableIdentifier): boolean {
    return this.resolvedDependencies.some(([{ identifier: resolvedId }]) => {
      return identifier === resolvedId;
    });
  }

  public set(
    identifier: InjectableIdentifier,
    value: Type | StubbedInstance<unknown> | FinalValue,
    metadata?: IdentifierMetadata
  ): void {
    this.resolvedDependencies.push([{ identifier, metadata: metadata as never }, value]);
  }

  public get(
    identifier: InjectableIdentifier
  ): Type | StubbedInstance<unknown> | FinalValue | undefined {
    return this.resolvedDependencies.find(([{ identifier: resolvedId }]) => {
      return identifier === resolvedId;
    })?.[1];
  }

  public entries(): IdentifierToMockOrFinal[] {
    return this.resolvedDependencies;
  }
}
