import type { ClassInjectable } from '@suites/types.di';
import { UndefinedDependency, UndefinedDependencyError } from '@suites/types.di';
import type { Type } from '@suites/types.common';
import { getClassMetadata } from '@inversifyjs/core';
import type { InversifyInjectableIdentifierMetadata } from './types.js';
import type { IdentifierObject, IdentifierBuilder } from './identifier-builder.static.js';

export type ClassPropsReflector = ReturnType<typeof ClassPropsReflector>;

export function ClassPropsReflector(identifierBuilder: IdentifierBuilder) {
  function reflectInjectables(targetClass: Type): ClassInjectable[] {
    const classMetadata = getClassMetadata(targetClass);
    const properties = classMetadata.properties;

    if (properties.size === 0) {
      return [];
    }

    const classInstance = Object.create(targetClass.prototype);
    const result: ClassInjectable[] = [];

    for (const [propertyKey, elementMetadata] of properties.entries()) {
      const propertyParamType = Reflect.getMetadata('design:type', classInstance, propertyKey) as
        | Type
        | undefined;

      if (!elementMetadata && !propertyParamType) {
        throw new UndefinedDependencyError(`Suites encountered an error while attempting to detect a token or type for the dependency for property '${String(propertyKey)}' in the class '${targetClass.name}'.
This issue is commonly caused by either improper decoration of the property or a problem during the reflection of the parameter type.
In some cases, this error may arise due to circular dependencies. If this is the case, please ensure that the circular dependency
is resolved, or consider using 'LazyServiceIdentifier' to address it.`);
      }

      const identifierAndMetadata = identifierBuilder.toIdentifierObject(
        elementMetadata,
        propertyParamType as Type
      );

      result.push({
        metadata: identifierAndMetadata.metadata,
        type: 'PROPERTY',
        identifier: identifierAndMetadata.identifier,
        value: setValue(propertyParamType, identifierAndMetadata),
        property: { key: propertyKey },
      } as InversifyInjectableIdentifierMetadata);
    }

    return result;
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

  return { reflectInjectables };
}
