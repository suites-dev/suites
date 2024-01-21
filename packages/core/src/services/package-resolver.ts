import { AutomockDependenciesAdapter } from '@suites/common';

export const AutomockAdapters: Record<string, string> = {
  nestjs: '@suites/adapters.nestjs',
  inversify: '@suites/adapters.inversify',
} as const;

interface NodeRequire {
  resolve(path: string): string;
  require(path: string): { default: AutomockDependenciesAdapter };
}

export class PackageResolver {
  public constructor(
    private readonly adapters: Record<string, string>,
    private readonly require: NodeRequire
  ) {}

  public resolveCorrespondingAdapter(): AutomockDependenciesAdapter | never {
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

    return this.require.require(this.adapters[adapterName]).default as AutomockDependenciesAdapter;
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
