import { SELF_DECLARED_DEPS_METADATA, PARAMTYPES_METADATA } from '@nestjs/common/constants';
import { Type } from '@automock/types';
import { MetadataReflector, NestJSInjectable } from './types';
import { ClassCtorInjectables } from '@automock/common/src';
import { CustomToken, ParamsTokensReflector } from './params-token-resolver';

export type ClassCtorReflector = ReturnType<typeof ClassCtorReflector>;

export function ClassCtorReflector(
  reflector: MetadataReflector,
  paramsTokensReflector: ParamsTokensReflector
) {
  function reflectInjectables(targetClass: Type): ClassCtorInjectables {
    const paramTypes = reflectParamTypes(targetClass);
    const paramTokens = reflectParamTokens(targetClass);
    const tokensIndexes = paramTokens.map(({ index }) => index);
    const resolveParamTokenCb = paramsTokensReflector.resolveDependencyValue(paramTokens);

    return paramTypes.map((typeOrUndefined, paramIndex) => {
      const isToken = tokensIndexes.includes(paramIndex);
      const error = new Error(
        `'${targetClass.name}' is missing a token for the dependency at index [${paramIndex}], did you forget to inject it using @Inject()?`
      );

      if (isToken) {
        try {
          return resolveParamTokenCb(typeOrUndefined, paramIndex);
        } catch (error) {
          throw error;
        }
      }

      if (!typeOrUndefined) {
        throw error;
      }

      return [typeOrUndefined, typeOrUndefined] as [Type, Type];
    });
  }

  function reflectParamTokens(targetClass: Type): CustomToken[] {
    return reflector.getMetadata(SELF_DECLARED_DEPS_METADATA, targetClass) || [];
  }

  function reflectParamTypes(targetClass: Type): (NestJSInjectable | undefined)[] {
    return reflector.getMetadata(PARAMTYPES_METADATA, targetClass) || [];
  }

  return { reflectInjectables };
}
