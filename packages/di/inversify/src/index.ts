import 'reflect-metadata';
import type { DependencyInjectionAdapter } from '@suites/types.di';
import { ClassPropsReflector } from './class-props-reflector';
import { ClassCtorReflector } from './class-ctor-reflector';
import { IdentifierBuilder } from './identifier-builder.static';
import { DependenciesAdapter } from './dependencies-adapter';

const InversifyJSDIAdapter: DependencyInjectionAdapter = ((
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
) => {
  return DependenciesAdapter(classPropsReflector, classCtorReflector);
})(
  ClassPropsReflector(Reflect, IdentifierBuilder()),
  ClassCtorReflector(Reflect, IdentifierBuilder())
);

export { IdentifierMetadata } from './types';
export const adapter = InversifyJSDIAdapter;
