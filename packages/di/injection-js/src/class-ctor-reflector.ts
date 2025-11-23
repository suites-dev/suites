import 'reflect-metadata';
import type { Type } from '@suites/types.common';
import type { ClassInjectable } from '@suites/types.di';
import { UndefinedDependency, UndefinedDependencyError } from '@suites/types.di';

export type ClassCtorReflector = ReturnType<typeof ClassCtorReflector>;

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
   * Note: Resolution modifiers like @Optional(), @Self(), @SkipSelf(), @Host() are ignored
   * as they are production DI resolution hints that don't affect Suites' flat virtual test container.
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

      // Extract token from @Inject(token) decorator
      const token = extractToken(paramDecorators);

      // Find the Type in decorators (for cases where @Inject() specifies a different type)
      const decoratorType = paramDecorators.find(
        (item: any) => typeof item === 'function' && !item.ngMetadataName
      );

      // Determine the identifier (from @Inject() token, decorator type, or param type)
      const identifier = token || decoratorType || paramType;

      if (!identifier) {
        throw new UndefinedDependencyError(
          `Suites encountered an error while attempting to detect a token or type for the
dependency at index [${index}] in the class '${targetClass.name}'.
This issue is commonly caused by either improper parameter decoration or a problem during the reflection of
the parameter type. Make sure parameters are decorated with @Inject() or have valid type annotations.`
        );
      }

      // Include metadata only for token-based injection
      // This tells Suites core this is a token injection, not a primitive needing .final()
      const hasToken = token !== undefined;

      return {
        identifier,
        value: paramType || UndefinedDependency,
        type: 'PARAM',
        ...(hasToken && { metadata: { token } }),
      } satisfies ClassInjectable;
    });
  }

  /**
   * Extracts token from @Inject(token) decorator.
   * Other decorators like @Optional(), @Self(), @SkipSelf(), @Host() are ignored.
   */
  function extractToken(decorators: any[]): unknown | undefined {
    for (const decorator of decorators) {
      if (decorator && decorator.token !== undefined) {
        return decorator.token;
      }
    }
    return undefined;
  }

  return { reflectInjectables };
}
