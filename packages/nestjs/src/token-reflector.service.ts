import { Type } from '@automock/types';
import { ConstructorParam, CustomInjectableToken } from './types';

export interface CustomToken {
  index: number;
  param: ConstructorParam;
}

export type TokensReflector = {
  attachTokenToDependency(
    tokens: CustomToken[]
  ): (typeOrUndefined: Type | string | undefined, index: number) => [string | Type, Type];
};

// TODO: Add unit spec for tokens reflector
export const TokensReflector = (function (): TokensReflector {
  function lookupTokenInParams(tokens: CustomToken[], index: number): ConstructorParam | undefined {
    const record = tokens.find((token) => token.index === index);
    return record?.param;
  }

  function resolveReferenceCallbackFromToken(token: CustomInjectableToken | Type): Type | string {
    return typeof token === 'object' && 'forwardRef' in token ? token.forwardRef() : token;
  }

  function attachTokenToDependency(
    tokens: CustomToken[]
  ): (typeOrUndefined: Type | string | undefined, index: number) => [string | Type, Type] {
    return (dependencyType: Type, index: number): [string | Type, Type] => {
      const token = lookupTokenInParams(tokens, index);
      const isAnonymousObjectType = dependencyType && (dependencyType as Type).name === 'Object';

      if (token) {
        const ref = resolveReferenceCallbackFromToken(token);

        if (isAnonymousObjectType && typeof ref !== 'string') {
          return [ref, ref];
        }

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
    attachTokenToDependency,
  };
})();
