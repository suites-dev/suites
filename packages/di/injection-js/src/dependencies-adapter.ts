import type { Type } from '@suites/types.common';
import type {
  DependencyInjectionAdapter,
  ClassInjectable,
  InjectableRegistry,
  InjectableIdentifier,
} from '@suites/types.di';
import type { ClassPropsReflector } from './class-props-reflector';
import type { ClassCtorReflector } from './class-ctor-reflector';

export type DependenciesAdapter = (
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
) => DependencyInjectionAdapter;

/**
 * Creates a dependency injection adapter for injection-js.
 * This adapter inspects decorated classes to extract their dependencies using TypeScript metadata
 * and injection-js decorator information.
 *
 * @since 3.0.1
 * @param classPropsReflector - Reflector for class properties (currently returns empty array)
 * @param classCtorReflector - Reflector for class constructor parameters
 * @returns DependencyInjectionAdapter implementation for injection-js
 *
 * @example
 * import { DependenciesAdapter } from './dependencies-adapter';
 * import { ClassPropsReflector } from './class-props-reflector';
 * import { ClassCtorReflector } from './class-ctor-reflector';
 *
 * const adapter = DependenciesAdapter(
 *   ClassPropsReflector(),
 *   ClassCtorReflector()
 * );
 */
export function DependenciesAdapter(
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
): DependencyInjectionAdapter {
  function inspect(targetClass: Type): InjectableRegistry {
    const ctorInjectables = classCtorReflector.reflectInjectables(targetClass);
    // const propsInjectables = classPropsReflector.reflectInjectables(targetClass);
    const allInjectables = [...ctorInjectables]; // ...propsInjectables

    return {
      resolve(identifier: InjectableIdentifier): ClassInjectable | undefined {
        return allInjectables.find(
          ({ identifier: injectableIdentifier }) => injectableIdentifier === identifier
        );
      },
      list(): ClassInjectable[] {
        return allInjectables;
      },
    };
  }

  return { inspect };
}
