import 'reflect-metadata';
import { DependencyInjectionAdapter } from '@suites/types.di';
import { DependenciesAdapter } from './dependencies-adapter';
import { ClassCtorReflector } from './class-ctor-reflector';

const TSyringeAutomockDependenciesAdapter: DependencyInjectionAdapter = ((
  classCtorReflector: ClassCtorReflector
) => {
  return DependenciesAdapter( classCtorReflector);
})(
  ClassCtorReflector(Reflect)
);

export { IdentifierMetadata } from './types';
export const adapter = TSyringeAutomockDependenciesAdapter;
