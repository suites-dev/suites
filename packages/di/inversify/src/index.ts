/**
 * @packageDocumentation
 * InversifyJS Dependency Injection Adapter for Suites
 *
 * This package provides integration between Suites and InversifyJS's dependency injection system.
 * It enables Suites to automatically discover and mock dependencies in InversifyJS applications.
 *
 * @since 3.0.0
 * @see {@link https://suites.dev/docs/get-started/installation | Installation Guide}
 * @see {@link https://inversify.io/docs/ecosystem/suites/ | InversifyJS Official Integration}
 */
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

/**
 * InversifyJS dependency injection adapter for Suites.
 *
 * This adapter enables Suites to work with InversifyJS's dependency injection system,
 * automatically discovering constructor dependencies decorated with `@injectable()`,
 * `@inject()`, and other InversifyJS decorators.
 *
 * @since 3.0.0
 * @see {@link https://suites.dev/docs/get-started/installation | Installation Guide}
 *
 * @example
 * ```ts
 * // This adapter is automatically used when @suites/di.inversify is installed
 * import { TestBed } from '@suites/unit';
 *
 * @injectable()
 * class UserService {
 *   constructor(@inject(TYPES.UserRepository) private userRepo: UserRepository) {}
 * }
 *
 * const { unit, unitRef } = await TestBed.solitary(UserService).compile();
 * ```
 */
export const adapter = InversifyJSDIAdapter;
