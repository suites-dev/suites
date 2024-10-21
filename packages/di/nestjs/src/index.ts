import 'reflect-metadata';
import type { DependencyInjectionAdapter } from '@suites/types.di';
import { DependenciesAdapter } from './dependencies-adapter';
import { ClassPropsReflector } from './class-props-reflector';
import { ClassCtorReflector } from './class-ctor-reflector';
import { ParamsTokensReflector } from './params-token-resolver';
import { PropertyReflectionStrategies } from './property-reflection-strategies.static';

const NestJSDIAdapter: DependencyInjectionAdapter = ((
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
) => {
  return DependenciesAdapter(classPropsReflector, classCtorReflector);
})(
  ClassPropsReflector(Reflect, PropertyReflectionStrategies),
  ClassCtorReflector(Reflect, ParamsTokensReflector)
);

export { IdentifierMetadata } from './types';
export const adapter = NestJSDIAdapter;
