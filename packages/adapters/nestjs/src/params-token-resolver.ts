import { Type } from '@automock/types';
import { UndefinedDependency, UndefinedDependencySymbol } from '@automock/common';
import { CustomInjectableToken, NestJSInjectable } from './types';

export interface CustomToken {
  index: number;
  param: NestJSInjectable;
}

export type ParamsTokensReflector = {
  resolveDependencyValue(
    tokens: CustomToken[]
  ): (
    typeOrUndefined: NestJSInjectable | undefined,
    index: number
  ) => [string | Type, Type | UndefinedDependencySymbol];
};

export const ParamsTokensReflector = (function (): ParamsTokensReflector {
  function lookupTokenInParams(tokens: CustomToken[], index: number): NestJSInjectable | undefined {
    const record = tokens.find((token) => token.index === index);
    return record?.param;
  }

  function resolveReferenceCallbackFromToken(
    token: CustomInjectableToken | Type
  ): Type | string | undefined {
    return typeof token === 'object' && 'forwardRef' in token ? token.forwardRef() : token;
  }

  function resolveDependencyValue(
    tokens: CustomToken[]
  ): (
    typeOrUndefined: NestJSInjectable,
    tokenIndexInCtor: number
  ) => [string | Type, Type | UndefinedDependencySymbol] {
    return (
      dependencyType: Type,
      index: number
    ): [string | Type, Type | UndefinedDependencySymbol] => {
      const token = lookupTokenInParams(tokens, index);

      if (!token) {
        throw new Error(`No token found at index: ${index}`);
      }

      const ref = resolveReferenceCallbackFromToken(token);
      const refIsAType = typeof ref !== 'string';

      if (refIsAType) {
        return [ref as Type, ref as Type];
      }

      if (!dependencyType && typeof token === 'string') {
        return [token, UndefinedDependency];
      } else if (!dependencyType && typeof ref !== 'string') {
        return [ref, UndefinedDependency];
      }

      return [ref, dependencyType];
    };
  }

  return {
    resolveDependencyValue,
  };
})();
