import { Type } from '@automock/types';
import {
  ClassInjectable,
  InjectableIdentifier,
  UndefinedDependency,
  UndefinedTokenError,
} from '@automock/common';
import { TSyringeReflectedInjectableIdentifier } from './types';

export interface NestCustomToken {
  index: number;
  param: TSyringeReflectedInjectableIdentifier;
}

export type ParamsTokensReflector = {
  resolveDependencyValue(
    tokens: NestCustomToken[]
  ): (
    typeOrUndefined: TSyringeReflectedInjectableIdentifier | undefined,
    index: number
  ) => Omit<ClassInjectable, 'type'>;
};

export const ParamsTokensReflector = (function (): ParamsTokensReflector {
  function lookupTokenInParams(
    tokens: NestCustomToken[],
    index: number
  ): TSyringeReflectedInjectableIdentifier | undefined {
    const record = tokens.find((token) => token.index === index);
    return record?.param;
  }

  function resolveReferenceCallbackFromToken(
    token: TSyringeReflectedInjectableIdentifier
  ): InjectableIdentifier {
    return (
      typeof token === 'object' && 'wrap' in token ? token.wrap() : token
    ) as InjectableIdentifier;
  }

  function resolveDependencyValue(
    tokens: NestCustomToken[]
  ): (
    typeOrUndefined: TSyringeReflectedInjectableIdentifier | undefined,
    tokenIndexInCtor: number
  ) => Omit<ClassInjectable, 'type'> {
    return (dependencyType: Type, index: number): Omit<ClassInjectable, 'type'> => {
      const token = lookupTokenInParams(tokens, index);

      if (!token) {
        throw new UndefinedTokenError(`Automock encountered an error while attempting to detect a token for the
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
