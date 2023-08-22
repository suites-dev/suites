import { Type } from '@automock/types';
import {
  AutomockDependenciesAdapter,
  ClassInjectable,
  ClassInjectablesContainer,
} from '@automock/common';
import { ClassPropsReflector } from './class-props-reflector';
import { ClassCtorReflector } from './class-ctor-reflector';

export function ReflectorFactory(
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
): AutomockDependenciesAdapter {
  function reflect(targetClass: Type): ClassInjectablesContainer {
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

  return { reflect };
}
