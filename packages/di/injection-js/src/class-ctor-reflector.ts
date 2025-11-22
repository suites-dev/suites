import 'reflect-metadata';
import type { Type } from '@suites/types.common';
import type { ClassInjectable } from '@suites/types.di';
import { UndefinedDependency, UndefinedDependencyError } from '@suites/types.di';

export type ClassCtorReflector = ReturnType<typeof ClassCtorReflector>;

/**
 * Identifier metadata for injection-js adapter.
 * Only includes the token from @Inject(token) decorator.
 *
 * Note: @Optional(), @Self(), @SkipSelf(), @Host() decorators are ignored
 * as they are production DI resolution hints that don't affect the flat
 * virtual test container used in Suites.
 */
interface InjectionJsParameterMetadata {
  token?: unknown;
}

/**
 * Creates a constructor reflector that extracts injection-js metadata
 * from decorated classes using reflect-metadata.
 *
 * @returns An object with a `reflectInjectables` method
 */
export function ClassCtorReflector() {
  /**
   * Reflects on a target class constructor to extract dependency information.
   * Uses injection-js metadata conventions: 'design:paramtypes' and 'parameters'.
   *
   * @param targetClass - The class to reflect on
   * @returns Array of ClassInjectable objects representing constructor parameters
   * @throws {UndefinedDependencyError} If parameter types cannot be determined
   */
  function reflectInjectables(targetClass: Type): ClassInjectable[] | never {
    // Get parameter types from TypeScript's emitted metadata
    const paramTypes: Type[] = Reflect.getOwnMetadata('design:paramtypes', targetClass) || [];

    // Get injection-js parameter decorators metadata (from @Inject(), @Optional(), etc.)
    // injection-js stores this as 'parameters' metadata
    const parametersMetadata = Reflect.getOwnMetadata('parameters', targetClass) || [];

    if (paramTypes.length === 0 && parametersMetadata.length === 0) {
      return [];
    }

    // Determine the actual number of parameters
    const paramCount = Math.max(paramTypes.length, parametersMetadata.length);

    return Array.from({ length: paramCount }, (_, index) => {
      const paramType = paramTypes[index];
      const paramDecorators = parametersMetadata[index] || [];

      // Extract metadata from ALL decorators (both Type and decorator instances)
      const metadata = extractMetadata(paramDecorators);

      // Find the Type in decorators (for cases where @Inject() specifies a different type)
      const decoratorType = paramDecorators.find((item: any) => typeof item === 'function' && !item.ngMetadataName);

      // Determine the identifier (from @Inject() token, decorator type, or param type)
      const identifier = metadata.token || decoratorType || paramType;

      if (!identifier) {
        throw new UndefinedDependencyError(
          `Suites encountered an error while attempting to detect a token or type for the
dependency at index [${index}] in the class '${targetClass.name}'.
This issue is commonly caused by either improper parameter decoration or a problem during the reflection of
the parameter type. Make sure parameters are decorated with @Inject() or have valid type annotations.`
        );
      }

      return {
        identifier,
        value: paramType || UndefinedDependency,
        type: 'PARAM',
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      } as ClassInjectable;
    });
  }

  /**
   * Extracts token from injection-js parameter decorators.
   * Only extracts @Inject(token) - other decorators like @Optional(), @Self(),
   * @SkipSelf(), @Host() are ignored as they don't affect the virtual test container.
   */
  function extractMetadata(decorators: any[]): InjectionJsParameterMetadata {
    const metadata: InjectionJsParameterMetadata = {};

    for (const decorator of decorators) {
      if (!decorator) continue;

      // Handle @Inject(token)
      if (decorator.token !== undefined) {
        metadata.token = decorator.token;
      }
    }

    return metadata;
  }

  return { reflectInjectables };
}
