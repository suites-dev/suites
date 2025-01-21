import { InjectionToken } from 'tsyringe';
import type { Type } from '@suites/types.common';
import type { ClassInjectable } from '@suites/types.di';
import {
  NonExistingDependency,
  UndefinedDependency,
  UndefinedDependencyError,
} from '@suites/types.di';
import type {
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

    // function DummyDecorator(target: Function) {}
    // @DummyDecorator
    // class Hmm {
    //   constructor(count: number) {}
    // }

    // console.log('Hmm', reflectParamTypes(Hmm));
    // -> Hmm [ [ Function: Number ] ]

    /**
     * Line 14 in https://github.com/microsoft/tsyringe/blob/2cd2e00a5fd25308bcf911ca250ded3fe9083af5/src/reflection-helpers.ts#L14
     * is called by `injectable()` decorator tsyring, and looks like tsyringe is overwriting the design:paramtypes with it's own token format
     * 
     * And that token format doesn't have the usual primitive constructors like String|Boolean etc :thinking_face:
     */ 

    return paramTypes.map((injectable, paramIndex) => {
      const error = `Automock encountered an error while attempting to detect a token or type for the
dependency at index [${paramIndex}] in the class '${targetClass.name}'.
This issue is commonly caused by either improper parameter decoration or a problem during the reflection of
the parameter type. In some cases, this error may arise due to circular dependencies. If this is the case,
please ensure that the circular dependency is resolved, or consider using 'delay()' to address it.`;

      if (!injectable) {
        throw new UndefinedDependencyError(error);
      }

      console.log('----', injectable);

      if (isNormalToken(injectable)) {
        return {
          identifier: injectable,
          metadata: undefined,
          type: 'PARAM',
          value: UndefinedDependency,
        };
      }

      if (isConstructorToken(injectable)) {
        return {
          identifier: injectable,
          metadata: undefined,
          type: 'PARAM',
          value: injectable,
        };
      }

      if (isDelayedConstructor(injectable)) {
        const value = (injectable as { wrap: () => Type | undefined }).wrap();

        if (!value) {
          throw new Error();
        }

        return {
          identifier: value,
          metadata: undefined,
          value: value,
          type: 'PARAM',
        };
      }

      if (descriptionHasArgs(injectable)) {
        return {
          identifier: injectable.token,
          type: 'PARAM',
          value: injectable.token,
          metadata: { args: injectable.transformArgs },
        } as ClassInjectable<IdentifierMetadata>;
      }

      return {
        identifier: injectable,
        metadata: undefined,
        type: 'PARAM',
        value: UndefinedDependency,
      };
    });
  }

  function reflectParamTypes(targetClass: Type): TSyringeReflectedInjectableIdentifier[] {
    return Reflect.getMetadata(PARAMTYPES_METADATA, targetClass) || [];
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
