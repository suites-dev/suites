import { Type, DependencyKey } from '@automock/common';

export type DependenciesMap = Map<DependencyKey, Type<unknown>>;

export interface ClassReflector {
  dependencies: DependenciesMap;
  resolve: (keyOrToken: DependencyKey<unknown>) => Type<unknown>;
}

export abstract class ClassReflectorAbstract implements ClassReflector {
  private readonly dependenciesMap: DependenciesMap = new Map<string | Type<unknown>, Type<unknown>>();

  protected constructor(protected readonly reflector: typeof Reflect, protected readonly targetClass: Type<unknown>) {
    this.dependenciesMap = this.reflectDependencies();
  }

  public resolve(keyOrToken: DependencyKey<unknown>): Type<unknown> {
    return this.dependenciesMap.get(keyOrToken);
  }

  public get dependencies(): Map<string | Type<unknown>, Type<unknown>> {
    return this.dependenciesMap;
  }

  protected abstract reflectDependencies(): Map<string | Type<unknown>, Type<unknown>>;
}
