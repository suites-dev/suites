import isEqual from 'lodash.isequal';
import { Type } from '@automock/types';
import {
  AutomockDependenciesAdapter,
  ClassInjectable,
  InjectablesRegistry,
  InjectableIdentifier,
  WithMetadata,
} from '@automock/common';
import { ClassPropsReflector } from './class-props-reflector';
import { ClassCtorReflector } from './class-ctor-reflector';
import { IdentifierMetadata } from './types';

export type DependenciesAdapter = (
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
) => AutomockDependenciesAdapter;

export function DependenciesAdapter(
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
): AutomockDependenciesAdapter {
  function inspect(targetClass: Type): InjectablesRegistry {
    const ctorInjectables = classCtorReflector.reflectInjectables(targetClass);
    const propsInjectables = classPropsReflector.reflectInjectables(targetClass);
    const allInjectables = [...ctorInjectables, ...propsInjectables] as WithMetadata<never>[];

    return {
      resolve(
        identifier: InjectableIdentifier,
        metadata: IdentifierMetadata | undefined
      ): ClassInjectable | undefined {
        // If there is one identifier, it is enough to match, no need to check metadata
        const injectables = allInjectables.filter(
          ({ identifier: injectableIdentifier }) => injectableIdentifier === identifier
        );

        if (injectables.length === 1 && !metadata) {
          return injectables[0];
        }

        // If there are more than one injectable with the same identifier, we need to check metadata as well
        return injectables.find(({ metadata: injectableMetadata }) =>
          isEqual(injectableMetadata, metadata)
        );
      },
      list(): ClassInjectable[] {
        return allInjectables;
      },
    };
  }

  return { inspect };
}
