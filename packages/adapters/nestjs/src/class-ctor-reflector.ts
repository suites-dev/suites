import { SELF_DECLARED_DEPS_METADATA, PARAMTYPES_METADATA } from '@nestjs/common/constants';
import { Type } from '@automock/types';
import { MetadataReflector, NestJSInjectable } from './types';
import { ClassInjectable } from '@automock/common';
import { CustomToken, ParamsTokensReflector } from './params-token-resolver';

export type ClassCtorReflector = ReturnType<typeof ClassCtorReflector>;

export function ClassCtorReflector(
  reflector: MetadataReflector,
  paramsTokensReflector: ParamsTokensReflector
) {
  function reflectInjectables(targetClass: Type): ClassInjectable[] | never {
    const paramTypes = reflectParamTypes(targetClass);
    const paramTokens = reflectParamTokens(targetClass);
    const tokensIndexes = paramTokens.map(({ index }) => index);
    const resolveParamTokenCb = paramsTokensReflector.resolveDependencyValue(paramTokens);

    return paramTypes.map((typeOrUndefined, paramIndex) => {
      const isToken = tokensIndexes.includes(paramIndex);
      const error =
        new Error(`Automock encountered an error while attempting to detect a token or type for the dependency at index [${paramIndex}] in the class '${targetClass.name}'.
        This issue is commonly caused by either improper parameter decoration or a problem during the reflection of the parameter type.
        In some cases, this error may arise due to circular dependencies. If this is the case, please ensure that the circular dependency
        is resolved, or consider using 'forwardRef()' to address it.`);

      if (isToken) {
        try {
          const resolved = resolveParamTokenCb(typeOrUndefined, paramIndex);
          return { ...resolved, type: 'PARAM' };
        } catch (error) {
          throw error;
        }
      }

      if (!typeOrUndefined) {
        throw error;
      }

      return {
        type: 'PARAM',
        identifier: typeOrUndefined as Type,
        value: typeOrUndefined as Type,
      } as ClassInjectable<never>;
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
