import { Type } from '@automock/types';
import { UndefinedOrNotFoundSymbol, UndefinedOrNotFound } from '@automock/common';
import { NestJSInjectable, CustomInjectableToken } from './types';

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
  ) => [string | Type, Type | UndefinedOrNotFoundSymbol];
};

export const ParamsTokensReflector = (function (): ParamsTokensReflector {
  function lookupTokenInParams(tokens: CustomToken[], index: number): NestJSInjectable | undefined {
    const record = tokens.find((token) => token.index === index);
    return record?.param;
  }

  function resolveReferenceCallbackFromToken(token: CustomInjectableToken | Type): Type | string {
    return typeof token === 'object' && 'forwardRef' in token ? token.forwardRef() : token;
  }

  function resolveDependencyValue(
    tokens: CustomToken[]
  ): (
    typeOrUndefined: NestJSInjectable,
    tokenIndexInCtor: number
  ) => [string | Type, Type | UndefinedOrNotFoundSymbol] {
    return (
      dependencyType: Type,
      index: number
    ): [string | Type, Type | UndefinedOrNotFoundSymbol] => {
      const token = lookupTokenInParams(tokens, index);

      if (!token) {
        throw new Error(`No token found at index: ${index}`);
      }

      const ref = resolveReferenceCallbackFromToken(token);
      const refIsAType = typeof ref !== 'string';

      if (refIsAType) {
        return [ref, ref];
      }

      if (!dependencyType && typeof token === 'string') {
        return [token, UndefinedOrNotFound];
      } else if (!dependencyType && typeof ref !== 'string') {
        return [ref, UndefinedOrNotFound];
      }

      return [ref, dependencyType];
    };
  }

  return {
    resolveDependencyValue,
  };
})();
