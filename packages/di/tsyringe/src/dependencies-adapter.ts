import type { Type } from '@suites/types.common';
import type {
  DependencyInjectionAdapter,
  ClassInjectable,
  InjectableRegistry,
} from '@suites/types.di';
import type { ClassCtorReflector } from './class-ctor-reflector';

export function DependenciesAdapter(
  classCtorReflector: ClassCtorReflector
): DependencyInjectionAdapter {
  function inspect(targetClass: Type): InjectableRegistry {
    const injectables = classCtorReflector.reflectInjectables(targetClass);

    return {
      resolve(identifier: Type | string): ClassInjectable | undefined {
        return injectables.find(({ identifier: typeOrToken }) => typeOrToken === identifier);
      },
      list(): ClassInjectable[] {
        return injectables;
      },
    };
  }

  return { inspect };
}
