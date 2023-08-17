import { Type } from '@automock/types';
import { ClassInjectable, UndefinedDependency } from '@automock/common';
import { CustomInjectableToken, NestJSInjectable } from './types';

export interface CustomToken {
  index: number;
  param: NestJSInjectable;
}

export type ParamsTokensReflector = {
  resolveDependencyValue(
    tokens: CustomToken[]
  ): (typeOrUndefined: NestJSInjectable, index: number) => Omit<ClassInjectable, 'type'>;
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
  ) => Omit<ClassInjectable, 'type'> {
    return (dependencyType: Type, index: number): Omit<ClassInjectable, 'type'> => {
      const token = lookupTokenInParams(tokens, index);

      if (!token) {
        throw new Error(`No token found at index: ${index}`);
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

  return {
    resolveDependencyValue,
  };
})();
