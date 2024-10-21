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
    try {
      require.resolve(path);
      return true;
    } catch (e) {
      return false;
    }
  }
}
