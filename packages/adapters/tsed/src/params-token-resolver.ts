import { Type } from '@automock/types';
import { NestJSInjectable, CustomInjectableToken } from './types';

export interface CustomToken {
  index: number;
  param: NestJSInjectable;
}

export type ParamsTokensReflector = {
  resolveDependencyValue(
    tokens: CustomToken[]
  ): (typeOrUndefined: NestJSInjectable | undefined, index: number) => [string | Type, Type];
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
  ): (typeOrUndefined: NestJSInjectable | undefined, index: number) => [string | Type, Type] {
    return (dependencyType: Type, index: number): [string | Type, Type] => {
      const token = lookupTokenInParams(tokens, index);
      const isAnonymousObjectType = dependencyType && (dependencyType as Type).name === 'Object';

      if (token) {
        const ref = resolveReferenceCallbackFromToken(token);

        if (dependencyType) {
          return [ref, dependencyType];
        }
      } else if (dependencyType && !isAnonymousObjectType) {
        return [dependencyType, dependencyType];
      }

      throw new Error(`No token found at index: ${index}`);
    };
  }

  return {
    resolveDependencyValue,
  };
})();
