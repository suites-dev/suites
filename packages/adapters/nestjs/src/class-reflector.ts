import { Type } from '@automock/types';
import {
  DependenciesReflector as AutomockDependenciesReflector,
  ClassDependenciesMap,
} from '@automock/common';
import { ClassPropsReflector } from './class-props-reflector';
import { ClassCtorReflector } from './class-ctor-reflector';

export function ReflectorFactory(
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
): AutomockDependenciesReflector {
  function reflectDependencies(targetClass: Type): ClassDependenciesMap {
    return {
      constructor: classCtorReflector.reflectInjectables(targetClass),
      properties: classPropsReflector.reflectInjectables(targetClass),
    };
  }

  return { reflectDependencies };
}
