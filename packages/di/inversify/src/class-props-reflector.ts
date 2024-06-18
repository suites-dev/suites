import type { ClassInjectable } from '@suites/types.di';
import { UndefinedDependency, UndefinedDependencyError } from '@suites/types.di';
import type { Type } from '@suites/types.common';
import { METADATA_KEY } from 'inversify';
import type {
  InversifyInjectableIdentifierMetadata,
  InversifyInjectableMetadata,
  MetadataReflector,
} from './types';
import type { IdentifierObject, IdentifierBuilder } from './identifier-builder.static';

const { TAGGED_PROP } = METADATA_KEY;

export type ClassPropsReflector = ReturnType<typeof ClassPropsReflector>;

export function ClassPropsReflector(
  reflector: MetadataReflector,
  identifierBuilder: IdentifierBuilder
) {
  function reflectInjectables(targetClass: Type): ClassInjectable[] {
    const classProperties = reflectProperties(targetClass);
    const classInstance = Object.create(targetClass.prototype);

    return Object.keys(classProperties).map((propertyKey) => {
      const propertyParamType = reflector.getMetadata('design:type', classInstance, propertyKey) as
        | Type
        | undefined;

      const propertyMetadataItems = classProperties[propertyKey as never];

      if (!propertyMetadataItems && !propertyParamType) {
        throw new UndefinedDependencyError(`Suites encountered an error while attempting to detect a token or type for the dependency for property '${propertyKey}' in the class '${targetClass.name}'.
This issue is commonly caused by either improper decoration of the property or a problem during the reflection of the parameter type.
In some cases, this error may arise due to circular dependencies. If this is the case, please ensure that the circular dependency
is resolved, or consider using 'LazyServiceIdentifier' to address it.`);
      }

      const identifierAndMetadata = identifierBuilder.toIdentifierObject(
        propertyMetadataItems,
        propertyParamType as Type
      );

      return {
        metadata: identifierAndMetadata.metadata,
        type: 'PROPERTY',
        identifier: identifierAndMetadata.identifier,
        value: setValue(propertyParamType, identifierAndMetadata),
        property: { key: propertyKey },
      } as InversifyInjectableIdentifierMetadata;
    });
  }

  function setValue(propertyParamType: Type | undefined, identifierAndMetadata: IdentifierObject) {
    if (propertyParamType) {
      return propertyParamType;
    }

    if (typeof identifierAndMetadata.identifier === 'function') {
      return identifierAndMetadata.identifier;
    }

    return UndefinedDependency;
  }

  function reflectProperties(targetClass: Type): Record<string, InversifyInjectableMetadata[]> {
    return reflector.getMetadata(TAGGED_PROP, targetClass) || [];
  }

  return { reflectInjectables };
}
