import { Type } from '@automock/types';
import {
  ClassInjectable,
  NonExistingDependency,
  UndefinedDependency,
  UndefinedDependencyError,
} from '@automock/common';
import {
  IdentifierMetadata,
  MetadataReflector,
  TransformDescriptor,
  TSyringeReflectedInjectableIdentifier,
} from './types';

const PARAMTYPES_METADATA = 'design:paramtypes' as const;

export type ClassCtorReflector = ReturnType<typeof ClassCtorReflector>;

export function ClassCtorReflector(reflector: MetadataReflector) {
  function reflectInjectables(
    targetClass: Type
  ): (ClassInjectable | ClassInjectable<IdentifierMetadata>)[] {
    const paramTypes = reflectParamTypes(targetClass);

    return paramTypes.map((injectable, paramIndex) => {
      const error = `Automock encountered an error while attempting to detect a token or type for the
dependency at index [${paramIndex}] in the class '${targetClass.name}'.
This issue is commonly caused by either improper parameter decoration or a problem during the reflection of
the parameter type. In some cases, this error may arise due to circular dependencies. If this is the case,
please ensure that the circular dependency is resolved, or consider using 'delay()' to address it.`;

      if (!injectable) {
        throw new UndefinedDependencyError(error);
      }

      if (isNormalToken(injectable)) {
        return {
          identifier: injectable,
          type: 'PARAM',
          metadata: undefined,
          value: NonExistingDependency,
        };
      }

      if (isDelayedConstructor(injectable)) {
        const value = (injectable as { wrap: () => Type | undefined }).wrap();

        if (!value) {
          throw new Error();
        }

        return {
          identifier: value,
          value: value,
          metadata: undefined,
          type: 'PARAM',
        };
      }

      if (descriptionHasArgs(injectable)) {
        return {
          identifier: injectable.token,
          type: 'PARAM',
          value: NonExistingDependency,
          metadata: { args: injectable.transformArgs },
        } as ClassInjectable<IdentifierMetadata>;
      }

      return {
        identifier: injectable,
        type: 'PARAM',
        value: UndefinedDependency,
      };
    });
  }

  function reflectParamTypes(
    targetClass: Type
  ): (TSyringeReflectedInjectableIdentifier | undefined)[] {
    return reflector.getMetadata(PARAMTYPES_METADATA, targetClass) || [];
  }

  function isNormalToken(token: TSyringeReflectedInjectableIdentifier): token is string | symbol {
    return typeof token === 'string' || typeof token === 'symbol';
  }

  function descriptionHasArgs(
    descriptor: TSyringeReflectedInjectableIdentifier
  ): descriptor is TransformDescriptor {
    return typeof descriptor === 'object' && 'token' in descriptor && 'transformArgs' in descriptor;
  }

  function isConstructorToken(token: TSyringeReflectedInjectableIdentifier): boolean {
    return typeof token === 'function';
  }

  function isDelayedConstructor(token: TSyringeReflectedInjectableIdentifier): boolean {
    return typeof token === 'object' && 'wrap' in token;
  }

  return { reflectInjectables };
}
