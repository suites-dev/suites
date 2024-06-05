import isEqual from 'lodash.isequal';
import type { Type } from '@suites/types.common';
import type {
  DependencyInjectionAdapter,
  ClassInjectable,
  InjectableRegistry,
  InjectableIdentifier,
  WithMetadata,
} from '@suites/types.di';
import type { ClassPropsReflector } from './class-props-reflector';
import type { ClassCtorReflector } from './class-ctor-reflector';
import type { IdentifierMetadata } from './types';

export type DependenciesAdapter = (
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
) => DependencyInjectionAdapter;

export function DependenciesAdapter(
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
): DependencyInjectionAdapter {
  function inspect(targetClass: Type): InjectableRegistry {
    const ctorInjectables = classCtorReflector.reflectInjectables(targetClass);
    const propsInjectables = classPropsReflector.reflectInjectables(targetClass);
    const allInjectables = [...ctorInjectables, ...propsInjectables] as WithMetadata<never>[];

    return {
      resolve(
        identifier: InjectableIdentifier,
        metadata: IdentifierMetadata | undefined
      ): ClassInjectable | undefined {
        const injectables = allInjectables.filter(
          ({ identifier: injectableIdentifier }) => injectableIdentifier === identifier
        );

        if (injectables.length === 0) {
          return undefined;
        }

        if (injectables.length === 1 && !metadata) {
          return injectables[0];
        }

        if (metadata) {
          return injectables.find(({ metadata: injectableMetadata }) =>
            isEqual(injectableMetadata, metadata)
          );
        }

        const foundInjectable = injectables.find(
          ({ identifier: injectableIdentifier, metadata: injectableMetadata }) =>
            identifier === injectableIdentifier && typeof injectableMetadata === 'undefined'
        );

        return foundInjectable ? foundInjectable : undefined;
      },
      list(): ClassInjectable[] {
        return allInjectables;
      },
    };
  }

  return { inspect };
}
