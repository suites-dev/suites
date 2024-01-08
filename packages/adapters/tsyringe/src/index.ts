import 'reflect-metadata';
import { AutomockDependenciesAdapter } from '@automock/common';
import { DependenciesAdapter } from './dependencies-adapter';
import { ClassCtorReflector } from './class-ctor-reflector';

const TSyringeAutomockDependenciesAdapter: AutomockDependenciesAdapter = ((
  classCtorReflector: ClassCtorReflector
) => {
  return DependenciesAdapter( classCtorReflector);
})(
  ClassCtorReflector(Reflect)
);

export { IdentifierMetadata } from './types';
export default TSyringeAutomockDependenciesAdapter;
