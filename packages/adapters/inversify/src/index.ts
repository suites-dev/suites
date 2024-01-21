import 'reflect-metadata';
import { AutomockDependenciesAdapter } from '@suites/common';
import { ClassPropsReflector } from './class-props-reflector';
import { ClassCtorReflector } from './class-ctor-reflector';
import { IdentifierBuilder } from './identifier-builder.static';
import { DependenciesAdapter } from './dependencies-adapter';

const InversifyAutomockDependenciesAdapter: AutomockDependenciesAdapter = ((
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
) => {
  return DependenciesAdapter(classPropsReflector, classCtorReflector);
})(
  ClassPropsReflector(Reflect, IdentifierBuilder()),
  ClassCtorReflector(Reflect, IdentifierBuilder())
);

export { IdentifierMetadata } from './types';

export default InversifyAutomockDependenciesAdapter;
