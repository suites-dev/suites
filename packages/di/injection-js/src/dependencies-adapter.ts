import type { Type } from '@suites/types.common';
import type {
  ClassInjectable,
  DependencyInjectionAdapter,
  InjectableIdentifier,
  InjectableRegistry,
} from '@suites/types.di';
import type { ClassCtorReflector } from './class-ctor-reflector';

export type DependenciesAdapter = (
  classCtorReflector: ClassCtorReflector
) => DependencyInjectionAdapter;

/**
 * Creates a dependency injection adapter for injection-js.
 * This adapter inspects decorated classes to extract their dependencies using TypeScript metadata
 * and injection-js decorator information.
 *
 * **Note on Property Injection:**
 * injection-js supports property injection via the `inject()` function:
 * ```typescript
 * class Service {
 *   http = inject(Http);
 * }
 * ```
 * However, this is a runtime mechanism that doesn't emit reflection metadata.
 * Suites relies on static analysis of decorator metadata to build the virtual test container,
 * so property injection is not compatible with Suites' approach. Only constructor injection
 * is supported.
 *
 * @since 3.0.1
 * @param classCtorReflector - Reflector for class constructor parameters
 * @returns DependencyInjectionAdapter implementation for injection-js
 *
 * @example
 * import { DependenciesAdapter } from './dependencies-adapter';
 * import { ClassCtorReflector } from './class-ctor-reflector';
 *
 * const adapter = DependenciesAdapter(ClassCtorReflector());
 */
export function DependenciesAdapter(
  classCtorReflector: ClassCtorReflector
): DependencyInjectionAdapter {
  function inspect(targetClass: Type): InjectableRegistry {
    const injectables = classCtorReflector.reflectInjectables(targetClass);

    return {
      resolve(identifier: InjectableIdentifier): ClassInjectable | undefined {
        return injectables.find(
          ({ identifier: injectableIdentifier }) => injectableIdentifier === identifier
        );
      },
      list(): ClassInjectable[] {
        return injectables;
      },
    };
  }

  return { inspect };
}
