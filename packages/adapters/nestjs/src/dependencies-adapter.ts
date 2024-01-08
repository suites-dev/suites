import { Type } from '@automock/types';
import {
  AutomockDependenciesAdapter,
  ClassInjectable,
  InjectablesRegistry,
} from '@automock/common';
import { ClassPropsReflector } from './class-props-reflector';
import { ClassCtorReflector } from './class-ctor-reflector';
import { MetadataReflector } from './types';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';

export function DependenciesAdapter(
  reflector: MetadataReflector,
  classPropsReflector: ClassPropsReflector,
  classCtorReflector: ClassCtorReflector
): AutomockDependenciesAdapter {
  function inspect(targetClass: Type): InjectablesRegistry {
    const ctorInjectables = classCtorReflector.reflectInjectables(targetClass);
    const propsInjectables = classPropsReflector.reflectInjectables(targetClass);
    const allInjectables = [...ctorInjectables, ...propsInjectables];

    const scopeNumberToName = {
      0: 'TRANSIENT',
      1: 'REQUEST',
      2: 'TRANSIENT',
    };

    const scope = reflector.getMetadata(SCOPE_OPTIONS_METADATA, targetClass);

    return {
      scope: 'TRANSIENT',
      resolve(identifier: Type | string): ClassInjectable | undefined {
        return allInjectables.find(({ identifier: typeOrToken }) => typeOrToken === identifier);
      },
      list(): ClassInjectable[] {
        return allInjectables;
      },
    };
  }

  return { inspect };
}
