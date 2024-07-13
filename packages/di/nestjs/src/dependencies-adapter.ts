import type { Type } from '@suites/types.common';
import type {
  DependencyInjectionAdapter,
  ClassInjectable,
  InjectableRegistry,
} from '@suites/types.di';
import type { ClassPropsReflector } from './class-props-reflector';
import type { ClassCtorReflector } from './class-ctor-reflector';

export function DependenciesAdapter(
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
): DependencyInjectionAdapter {
  function inspect(targetClass: Type): InjectableRegistry {
    const ctorInjectables = classCtorReflector.reflectInjectables(targetClass);
    const propsInjectables = classPropsReflector.reflectInjectables(targetClass);
    const allInjectables = [...ctorInjectables, ...propsInjectables];

    return {
      resolve(identifier: Type | string): ClassInjectable | undefined {
        return allInjectables.find(({ identifier: typeOrToken }) => typeOrToken === identifier);
      },
      list(): ClassInjectable[] {
        return allInjectables;
      },
    };
  }

  return { inspect };
}
