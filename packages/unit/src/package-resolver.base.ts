/**
 * Shared package resolver with IoC composition.
 * Module-specific strategies are injected via constructor.
 * @module
 */

import type { DependencyInjectionAdapter } from '@suites/types.di';
import type { DoublesAdapter } from '@suites/types.doubles';

/**
 * Strategy function for checking if a package is available
 */
export type PackageResolverStrategy = (path: string) => boolean;

/**
 * Package resolver that uses an injected strategy to check package availability
 */
export class PackageResolver<TAdapter extends DependencyInjectionAdapter | DoublesAdapter> {
  public constructor(
    private readonly adapters: Record<string, string>,
    private readonly resolverStrategy: PackageResolverStrategy
  ) {}

  public async resolveCorrespondingAdapter(): Promise<TAdapter | never> {
    const resolvers = Object.keys(this.adapters);

    const adapterName = resolvers.find((resolverName: string) =>
      this.resolverStrategy(this.adapters[resolverName])
    );

    if (!adapterName) {
      throw new Error('Adapter not found');
    }

    const adapter = await import(this.adapters[adapterName]);

    if (!Object.prototype.hasOwnProperty.call(adapter, 'adapter')) {
      throw new Error('Adapter has no export');
    }

    return import(this.adapters[adapterName]).then(
      (module: Record<'adapter', TAdapter>) => module.adapter
    );
  }
}
