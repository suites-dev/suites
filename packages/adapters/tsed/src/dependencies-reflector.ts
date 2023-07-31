import { Type } from '@automock/types';
import { DependenciesReflector, ClassDependenciesMap } from '@automock/common';
import { ClassPropsReflector } from './class-props-reflector';
import { ClassCtorReflector } from './class-ctor-reflector';

export class TsEDDependenciesReflector implements DependenciesReflector {
  constructor(
    private classPropsReflector: ClassPropsReflector,
    private classCtorReflector: ClassCtorReflector
  ) {}

  reflectDependencies(targetClass: Type): ClassDependenciesMap {
    return {
      constructor: this.classCtorReflector.reflectInjectables(targetClass),
      properties: this.classPropsReflector.reflectInjectables(targetClass),
    };
  }
}
