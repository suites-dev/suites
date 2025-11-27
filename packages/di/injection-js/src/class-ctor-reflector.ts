import 'reflect-metadata';
import type { Type } from '@suites/types.common';
import type { ClassInjectable, InjectableIdentifier } from '@suites/types.di';
import { UndefinedDependency, UndefinedDependencyError } from '@suites/types.di';
import type { InjectDecorator } from './interfaces';

export type ClassCtorReflector = ReturnType<typeof ClassCtorReflector>;

function isInjectDecorator(decorator: unknown): decorator is InjectDecorator {
  return (
    typeof decorator === 'object' &&
    decorator !== null &&
    'token' in decorator &&
    decorator.token !== undefined
  );
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
      const paramDecorators: ParameterDecorator[] = parametersMetadata[index] || [];

      // Extract token from @Inject(token) decorator
      const token = extractToken(paramDecorators);

      // Find the Type in decorators (for cases where @Inject() specifies a different type)
      const decoratorType: Type | undefined = paramDecorators.find(
        (item) => typeof item === 'function' && !(item as any).ngMetadataName
      ) as Type | undefined;

      // Determine the identifier (from @Inject() token, decorator type, or param type)
      let identifier: InjectableIdentifier;

      if (token) {
        identifier = token;
      } else if (decoratorType) {
        identifier = decoratorType;
      } else if (paramType) {
        identifier = paramType;
      } else {
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
      } satisfies ClassInjectable;
    });
  }

  /**
   * Extracts token from @Inject(token) decorator.
   * Other decorators like @Optional(), @Self(), @SkipSelf(), @Host() are ignored.
   *
   * @returns The token if found (string, symbol, or Type), otherwise undefined
   */
  function extractToken(decorators: ParameterDecorator[]): InjectableIdentifier | undefined {
    for (const decorator of decorators) {
      if (isInjectDecorator(decorator)) {
        // injection-js allows any value as token, but InjectableIdentifier accepts Type | string | symbol
        // We trust that users follow the correct pattern
        return decorator.token as InjectableIdentifier;
      }
    }
    return undefined;
  }

  return { reflectInjectables };
}
