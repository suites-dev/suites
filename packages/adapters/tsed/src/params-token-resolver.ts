import { Type } from '@automock/types';
import { NestJSInjectable, CustomInjectableToken } from './types';

export interface CustomToken {
  index: number;
  param: NestJSInjectable;
}

export class ParamsTokensReflector {
  static resolveDependencyValue(
    tokens: CustomToken[]
  ): (typeOrUndefined: NestJSInjectable | undefined, index: number) => [string | Type, Type] {
    return (dependencyType: Type, index: number): [string | Type, Type] => {
      const token = this.lookupTokenInParams(tokens, index);
      const isAnonymousObjectType = dependencyType && (dependencyType as Type).name === 'Object';

      if (token) {
        const ref = this.resolveReferenceCallbackFromToken(token);

        if (dependencyType) {
          return [ref, dependencyType];
        }
      } else if (dependencyType && !isAnonymousObjectType) {
        return [dependencyType, dependencyType];
      }

      throw new Error(`No token found at index: ${index}`);
    };
  }

  private static lookupTokenInParams(
    tokens: CustomToken[],
    index: number
  ): NestJSInjectable | undefined {
    const record = tokens.find((token) => token.index === index);
    return record?.param;
  }

  private static resolveReferenceCallbackFromToken(
    token: CustomInjectableToken | Type
  ): Type | string {
    return typeof token === 'object' && 'forwardRef' in token ? token.forwardRef() : token;
  }
}
