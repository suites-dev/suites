import 'reflect-metadata';
import { DependenciesReflector } from '@automock/common';
import { ReflectorFactory } from './class-reflector';
import { ClassPropsReflector } from './class-props-reflector';
import { ClassCtorReflector } from './class-ctor-reflector';
import { ParamsTokensReflector } from './params-token-resolver';
import { PropertyReflectionStrategies } from './property-reflection-strategies.static';

const DependenciesReflector: DependenciesReflector = ((
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
) => {
  return ReflectorFactory(classPropsReflector, classCtorReflector);
})(
  ClassPropsReflector(Reflect, PropertyReflectionStrategies),
  ClassCtorReflector(Reflect, ParamsTokensReflector)
);

export = DependenciesReflector;
