import { DependencyInjectionAdapter } from '@suites/types.di';
import { MockFunction } from '@suites/types.doubles';

interface NodeRequire<TAdapter extends DependencyInjectionAdapter | MockFunction<unknown>> {
  resolve(path: string): string;
  require(path: string): { default: TAdapter };
}

export class PackageResolver<TAdapter extends DependencyInjectionAdapter | MockFunction<unknown>> {
  public constructor(
    private readonly adapters: Record<string, string>,
    private readonly require: NodeRequire<TAdapter>
  ) {}

  public async resolveCorrespondingAdapter(): Promise<TAdapter | never> {
    const resolvers = Object.keys(this.adapters);

    const adapterName = resolvers.find((resolverName: string) =>
      this.packageIsAvailable(this.adapters[resolverName])
    );

    if (!adapterName) {
      throw new Error('Adapter not found');
    }

    const adapter = this.require.require(this.adapters[adapterName]);

    if (!Object.prototype.hasOwnProperty.call(adapter, 'default')) {
      throw new Error('Adapter has no default export');
    }

    return import(this.adapters[adapterName]).then((module) => module.default as TAdapter);
  }

  private packageIsAvailable(path: string): boolean {
    try {
      this.require.resolve(path);
      return true;
    } catch (e) {
      return false;
    }
  }
}
