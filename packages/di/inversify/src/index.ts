import 'reflect-metadata';
import type { DependencyInjectionAdapter } from '@suites/types.di';
import { ClassPropsReflector } from './class-props-reflector.js';
import { ClassCtorReflector } from './class-ctor-reflector.js';
import { IdentifierBuilder } from './identifier-builder.static.js';
import { DependenciesAdapter } from './dependencies-adapter.js';

const InversifyJSDIAdapter: DependencyInjectionAdapter = ((
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
) => {
  return DependenciesAdapter(classPropsReflector, classCtorReflector);
})(
  ClassPropsReflector(Reflect, IdentifierBuilder()),
  ClassCtorReflector(Reflect, IdentifierBuilder())
);

export { IdentifierMetadata } from './types.js';
export const adapter = InversifyJSDIAdapter;
