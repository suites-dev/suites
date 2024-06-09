import type { Type } from '@suites/types.common';
import type { ClassInjectable, InjectableIdentifier } from '@suites/types.di';
import { UndefinedDependency, UndefinedTokenError } from '@suites/types.di';
import type { NestInjectableIdentifier } from './types';

export interface NestCustomToken {
  index: number;
  param: NestInjectableIdentifier;
}

export type ParamsTokensReflector = {
  resolveDependencyValue(
    tokens: NestCustomToken[]
  ): (
    typeOrUndefined: NestInjectableIdentifier | undefined,
    index: number
  ) => Omit<ClassInjectable, 'type'>;
};

export const ParamsTokensReflector = (function (): ParamsTokensReflector {
  function lookupTokenInParams(
    tokens: NestCustomToken[],
    index: number
  ): NestInjectableIdentifier | undefined {
    const record = tokens.find((token) => token.index === index);
    return record?.param;
  }

  function resolveReferenceCallbackFromToken(
    token: NestInjectableIdentifier
  ): InjectableIdentifier {
    return (
      typeof token === 'object' && 'forwardRef' in token ? token.forwardRef() : token
    ) as InjectableIdentifier;
  }

  function resolveDependencyValue(
    tokens: NestCustomToken[]
  ): (
    typeOrUndefined: NestInjectableIdentifier | undefined,
    tokenIndexInCtor: number
  ) => Omit<ClassInjectable, 'type'> {
    return (dependencyType: Type, index: number): Omit<ClassInjectable, 'type'> => {
      const token = lookupTokenInParams(tokens, index);

      if (!token) {
        throw new UndefinedTokenError(`Suites encountered an error while attempting to detect a token for the
dependency at index [${index}].
This issue is commonly caused by either improper parameter decoration or a problem during the reflection of
the parameter type. In some cases, this error may arise due to circular dependencies. If this is the case,
please ensure that the circular dependency is resolved, or consider using 'forwardRef()' to address it.`);
      }

      const ref = resolveReferenceCallbackFromToken(token);
      const refIsAType = typeof ref !== 'string';

      if (refIsAType) {
        return {
          identifier: ref as Type,
          value: typeof dependencyType === 'undefined' ? UndefinedDependency : (ref as Type),
        };
      }

      if (!dependencyType && typeof token === 'string') {
        return {
          identifier: token,
          value: UndefinedDependency,
        };
      } else if (!dependencyType && typeof ref !== 'string') {
        return {
          identifier: ref,
          value: UndefinedDependency,
        };
      }

      return {
        identifier: ref,
        value: dependencyType,
      };
    };
  }

  return { resolveDependencyValue };
})();
