/**
 * Shared package resolver with IoC composition.
 * Module-specific strategies are injected via constructor.
 * @module
 */

import type { DependencyInjectionAdapter } from '@suites/types.di';
import type { DoublesAdapter } from '@suites/types.doubles';
import { resolve } from './resolve';

/**
 * Package resolver that uses an injected strategy to check package availability
 */
export class PackageResolver<TAdapter extends DependencyInjectionAdapter | DoublesAdapter> {
  public constructor(private readonly adapters: Record<string, string>) {}

  public async resolveCorrespondingAdapter(): Promise<TAdapter | never> {
    const resolvers = Object.keys(this.adapters);

    const adapterName = resolvers.find((resolverName: string) => {
      try {
        resolve(this.adapters[resolverName]);
        return true;
      } catch {
        return false;
      }
    });

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

export function createPackageResolver<TAdapter extends DependencyInjectionAdapter | DoublesAdapter>(
  adapters: Record<string, string>
): PackageResolver<TAdapter> {
  return new PackageResolver(adapters);
}
