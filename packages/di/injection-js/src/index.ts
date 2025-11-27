import 'reflect-metadata';
import type { DependencyInjectionAdapter } from '@suites/types.di';
import { ClassCtorReflector } from './class-ctor-reflector';
import { DependenciesAdapter } from './dependencies-adapter';

const InjectionJSDIAdapter: DependencyInjectionAdapter = DependenciesAdapter(
  ClassCtorReflector()
);

export { IdentifierMetadata } from './interfaces';
export const adapter = InjectionJSDIAdapter;
