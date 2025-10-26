import { getClassMetadata } from '@inversifyjs/core';
import type { Type } from '@suites/types.common';
import type { ClassInjectable } from '@suites/types.di';
import { UndefinedDependency, UndefinedDependencyError } from '@suites/types.di';
import type { InversifyInjectableIdentifierMetadata } from './types.js';
import type { IdentifierBuilder } from './identifier-builder.static.js';

export type ClassCtorReflector = ReturnType<typeof ClassCtorReflector>;

export type MetadataReader = {
  getClassMetadata: typeof getClassMetadata;
  getParamTypes: (target: Type) => Type[] | undefined;
};

export function ClassCtorReflector(
  identifierBuilder: IdentifierBuilder,
  metadataReader: MetadataReader = {
    getClassMetadata,
    getParamTypes: (target) => Reflect.getMetadata('design:paramtypes', target),
  }
) {
  function reflectInjectables(targetClass: Type): ClassInjectable[] | never {
    const classMetadata = metadataReader.getClassMetadata(targetClass);
    const constructorArguments = classMetadata.constructorArguments;

    // Get TypeScript design:paramtypes for fallback type information
    const paramTypes: Type[] = metadataReader.getParamTypes(targetClass) || [];

    return constructorArguments.map((elementMetadata, index) => {
      const paramType = paramTypes[index];

      // Check if this is a valid dependency
      if (!elementMetadata && paramType === undefined) {
        throw new UndefinedDependencyError(`Suites encountered an error while attempting to detect a token or type for the
dependency at index [${index}] under the class '${targetClass.name}'.
This issue is commonly caused by either improper parameter decoration or a problem during the reflection of
the parameter type. In some cases, this error may arise due to circular dependencies. If this is the case,
please ensure that the circular dependency is resolved, or consider using 'LazyServiceIdentifier' to address it.`);
      }

      // If no explicit decorator was used, use the TypeScript type
      if (!elementMetadata) {
        return {
          metadata: undefined,
          identifier: paramType,
          type: 'PARAM',
          value: paramType,
        } as InversifyInjectableIdentifierMetadata;
      }

      const identifierAndMetadata = identifierBuilder.toIdentifierObject(
        elementMetadata,
        paramType as Type
      );

      return {
        metadata: identifierAndMetadata.metadata,
        identifier: identifierAndMetadata.identifier,
        value: (paramType as Type) || UndefinedDependency,
        type: 'PARAM',
      } as InversifyInjectableIdentifierMetadata;
    });
  }

  return { reflectInjectables };
}
