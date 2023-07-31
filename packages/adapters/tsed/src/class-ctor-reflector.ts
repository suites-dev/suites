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
    const paramTypes = reflectParamTypes(targetClass)(reflector);
    const paramTokens = reflectParamTokens(targetClass)(reflector);

    const resolveParamTokenCb = paramsTokensReflector.resolveDependencyValue(paramTokens);

    return paramTypes.map((typeOrUndefined, index) => {
      try {
        return resolveParamTokenCb(typeOrUndefined, index);
      } catch (error) {
        throw new Error(
          `'${targetClass.name}' is missing a token for the dependency at index [${index}], did you forget to inject it using @Inject()?`
        );
      }
    });
  }

  function reflectParamTokens(targetClass: Type): (reflector: MetadataReflector) => CustomToken[] {
    return (reflector: MetadataReflector) =>
      reflector.getMetadata(SELF_DECLARED_DEPS_METADATA, targetClass) || [];
  }

  function reflectParamTypes(
    targetClass: Type
  ): (reflector: MetadataReflector) => (NestJSInjectable | undefined)[] {
    return (reflector: MetadataReflector) =>
      reflector.getMetadata(PARAMTYPES_METADATA, targetClass) || [];
  }

  return { reflectInjectables };
}
