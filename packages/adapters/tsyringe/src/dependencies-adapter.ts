import { Type } from '@automock/types';
import {
  AutomockDependenciesAdapter,
  ClassInjectable,
  InjectablesRegistry,
} from '@automock/common';
import { ClassCtorReflector } from './class-ctor-reflector';

export function DependenciesAdapter(
  classCtorReflector: ClassCtorReflector
): AutomockDependenciesAdapter {
  function inspect(targetClass: Type): InjectablesRegistry {
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
