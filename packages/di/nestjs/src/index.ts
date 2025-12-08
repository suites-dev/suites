/**
 * @packageDocumentation
 * NestJS Dependency Injection Adapter for Suites
 *
 * This package provides integration between Suites and NestJS's dependency injection system.
 * It enables Suites to automatically discover and mock dependencies in NestJS applications.
 *
 * @since 3.0.0
 * @see {@link https://suites.dev/docs/get-started/installation | Installation Guide}
 * @see {@link https://docs.nestjs.com/recipes/suites | NestJS Official Integration}
 */
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

/**
 * NestJS dependency injection adapter for Suites.
 *
 * This adapter enables Suites to work with NestJS's dependency injection system,
 * automatically discovering constructor and property dependencies decorated with
 * `@Injectable()`, `@Inject()`, and other NestJS decorators.
 *
 * @since 3.0.0
 * @see {@link https://suites.dev/docs/get-started/installation | Installation Guide}
 *
 * @example
 * ```ts
 * // This adapter is automatically used when @suites/di.nestjs is installed
 * import { TestBed } from '@suites/unit';
 *
 * @Injectable()
 * class UserService {
 *   constructor(private userRepo: UserRepository) {}
 * }
 *
 * const { unit, unitRef } = await TestBed.solitary(UserService).compile();
 * ```
 */
export const adapter = NestJSDIAdapter;
