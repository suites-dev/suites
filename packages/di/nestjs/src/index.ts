import 'reflect-metadata';
import type { DependencyInjectionAdapter } from '@suites/types.di';
import { DependenciesAdapter } from './dependencies-adapter.js';
import { ClassPropsReflector } from './class-props-reflector.js';
import { ClassCtorReflector } from './class-ctor-reflector.js';
import { ParamsTokensReflector } from './params-token-resolver.js';
import { PropertyReflectionStrategies } from './property-reflection-strategies.static.js';

const NestJSDIAdapter: DependencyInjectionAdapter = ((
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
) => {
  return DependenciesAdapter(classPropsReflector, classCtorReflector);
})(
  ClassPropsReflector(Reflect, PropertyReflectionStrategies),
  ClassCtorReflector(Reflect, ParamsTokensReflector)
);

export { IdentifierMetadata } from './types.js';
export const adapter = NestJSDIAdapter;
