import { DependenciesReflector } from '@automock/common';

export const AutomockAdapters: Record<string, string> = {
  nestjs: '@automock/adapters.nestjs',
} as const;

interface NodeRequire {
  resolve(path: string): string;
  require(path: string): unknown;
}

export class PackageResolver {
  public constructor(
    private readonly adapters: Record<string, string>,
    private readonly require: NodeRequire
  ) {}

  public resolveCorrespondingAdapter(): DependenciesReflector | never {
    const resolvers = Object.keys(this.adapters);

    const adapterName = resolvers.find((resolverName: string) =>
      this.packageIsAvailable(this.adapters[resolverName])
    );

    if (!adapterName) {
      throw new Error('No corresponding adapter found');
    }

    return this.require.require(this.adapters[adapterName]) as DependenciesReflector;
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
