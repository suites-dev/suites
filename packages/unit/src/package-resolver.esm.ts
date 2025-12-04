/**
 * This is a ESM version of the PackageResolver class.
 * It will be used in the ESM version of the Suites library.
 * We have to use a separate file because node auto resolves to esm if it sees the import keyword.
 * @module
 */

import type { DependencyInjectionAdapter } from '@suites/types.di';
import type { DoublesAdapter } from '@suites/types.doubles';

export class PackageResolver<TAdapter extends DependencyInjectionAdapter | DoublesAdapter> {
  public constructor(private readonly adapters: Record<string, string>) {}

  public async resolveCorrespondingAdapter(): Promise<TAdapter | never> {
    const resolvers = Object.keys(this.adapters);

    const adapterName = resolvers.find((resolverName: string) =>
      this.packageIsAvailable(this.adapters[resolverName])
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

  private packageIsAvailable(path: string): boolean {
    // In special cases like Vitest, we need to use the require function to resolve the path.
    if (typeof import.meta.resolve !== 'function' && typeof require === 'function') {
      try {
        require.resolve(path);
        return true;
      } catch (error) {
        return false;
      }
    }
    try {
      import.meta.resolve(path);
      return true;
    } catch {
      return false;
    }
  }
}
