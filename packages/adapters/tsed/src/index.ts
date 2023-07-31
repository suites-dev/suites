import 'reflect-metadata';
import { DependenciesReflector } from '@automock/common';
import { ReflectorFactory } from './class-reflector';
import { ClassPropsReflector } from './class-props-reflector';
import { ClassCtorReflector } from './class-ctor-reflector';
import { ParamsTokensReflector } from './params-token-resolver';

const DependenciesReflector: DependenciesReflector = ((
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
) => {
  return ReflectorFactory(classPropsReflector, classCtorReflector);
})(new ClassPropsReflector(Reflect), ClassCtorReflector(Reflect, ParamsTokensReflector));

export = DependenciesReflector;
