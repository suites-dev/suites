import type { Type } from '@suites/types.common';
import type { ClassInjectable } from '@suites/types.di';

export type ClassPropsReflector = ReturnType<typeof ClassPropsReflector>;

/**
 * Creates a property reflector stub for injection-js.
 * injection-js primarily supports constructor injection, so this returns an empty array.
 *
 * @returns An object with a `reflectInjectables` method
 */
export function ClassPropsReflector() {
  /**
   * Reflects on a target class properties to extract dependency information.
   * Currently returns an empty array as injection-js primarily uses constructor injection.
   *
   * @param _targetClass - The class to reflect on (unused)
   * @returns Empty array (no property injection support)
   *
   * @remarks
   * TODO: Future enhancement - support property decorators if injection-js adds them
   */
  function reflectInjectables(_targetClass: Type): ClassInjectable[] {
    return [];
  }

  return { reflectInjectables };
}
