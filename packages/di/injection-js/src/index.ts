import 'reflect-metadata';
import type { DependencyInjectionAdapter } from '@suites/types.di';
import { ClassPropsReflector } from './class-props-reflector';
import { ClassCtorReflector } from './class-ctor-reflector';
import { DependenciesAdapter } from './dependencies-adapter';

const InjectionJSDIAdapter: DependencyInjectionAdapter = ((
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
) => {
  return DependenciesAdapter(classPropsReflector, classCtorReflector);
})(ClassPropsReflector(), ClassCtorReflector());

export { IdentifierMetadata } from './types';
export const adapter = InjectionJSDIAdapter;
