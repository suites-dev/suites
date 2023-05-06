import { DependenciesReflector } from '../types';

export const AutomockReflectors: Record<string, string> = {
  nestjs: '@automock/nestjs',
  inversify: '@automock/inversify',
  tsed: '@automock/tsed',
} as const;

interface NodeRequire {
  resolve(path: string): string;
  require(path: string): unknown;
}

export class PackageResolver {
  public constructor(
    private readonly reflectors: Record<string, string>,
    private readonly require: NodeRequire
  ) {}

  public resolveCorrespondingReflector(): DependenciesReflector | never {
    const resolvers = Object.keys(this.reflectors);

    const reflectorName = resolvers.find((resolverName: string) =>
      this.packageIsAvailable(this.reflectors[resolverName])
    );

    if (!reflectorName) {
      throw new Error('No corresponding reflector found');
    }

    return this.require.require(this.reflectors[reflectorName]) as DependenciesReflector;
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
