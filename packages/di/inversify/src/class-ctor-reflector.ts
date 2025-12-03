import { METADATA_KEY } from 'inversify';
import type { Type } from '@suites/types.common';
import type { ClassInjectable } from '@suites/types.di';
import { UndefinedDependency, UndefinedDependencyError } from '@suites/types.di';
import type {
  InversifyInjectableIdentifierMetadata,
  InversifyInjectableMetadata,
  MetadataReflector,
} from './types';
import type { IdentifierBuilder } from './identifier-builder.static';

const { PARAM_TYPES, TAGGED } = METADATA_KEY;

export type ClassCtorReflector = ReturnType<typeof ClassCtorReflector>;

export function ClassCtorReflector(
  reflector: MetadataReflector,
  identifierBuilder: IdentifierBuilder
) {
  function reflectInjectables(targetClass: Type): ClassInjectable[] | never {
    const paramTypes = reflectParamTypes(targetClass);
    const reflectedParamTokens = reflectParamTokens(targetClass);
    const paramTokens = constructTokensArray(paramTypes, reflectedParamTokens);

    return paramTokens.map((inversifyInjectableMetadataItems, index) => {
      if (!inversifyInjectableMetadataItems) {
        if (paramTypes[index] === undefined) {
          throw new UndefinedDependencyError(`Suites encountered an error while attempting to detect a token or type for the
dependency at index [${index}] under the class '${targetClass.name}'.
This issue is commonly caused by either improper parameter decoration or a problem during the reflection of
the parameter type. In some cases, this error may arise due to circular dependencies. If this is the case,
please ensure that the circular dependency is resolved, or consider using 'LazyServiceIdentifier' to address it.`);
        }

        return {
          metadata: undefined,
          identifier: paramTypes[index],
          type: 'PARAM',
          value: paramTypes[index],
        } as InversifyInjectableIdentifierMetadata;
      }

      const identifierAndMetadata = identifierBuilder.toIdentifierObject(
        inversifyInjectableMetadataItems,
        paramTypes[index] as Type
      );

      return {
        metadata: identifierAndMetadata.metadata,
        identifier: identifierAndMetadata.identifier,
        value: (paramTypes[index] as Type) || UndefinedDependency,
        type: 'PARAM',
      } as InversifyInjectableIdentifierMetadata;
    });
  }

  function reflectParamTokens(targetClass: Type): Record<number, InversifyInjectableMetadata[]> {
    return reflector.getMetadata(TAGGED, targetClass) || {};
  }

  function reflectParamTypes(targetClass: Type): Type[] {
    return reflector.getMetadata(PARAM_TYPES, targetClass) || [];
  }

  function constructTokensArray(
    paramTypes: (Type | undefined)[],
    reflectedParamTokens: Record<number, InversifyInjectableMetadata[]>
  ): (undefined | InversifyInjectableMetadata[])[] {
    const paramTokens: (InversifyInjectableMetadata[] | undefined)[] =
      Object.values(reflectedParamTokens);

    if (paramTypes.length === paramTokens.length) {
      return paramTokens;
    }

    return paramTypes.map((_typeOrUndefined, index) => {
      if (!Object.prototype.hasOwnProperty.call(reflectedParamTokens, index)) {
        return undefined;
      }

      return reflectedParamTokens[index];
    });
  }

  return { reflectInjectables };
}
