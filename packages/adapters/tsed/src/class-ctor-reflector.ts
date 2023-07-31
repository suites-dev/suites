import { SELF_DECLARED_DEPS_METADATA, PARAMTYPES_METADATA } from '@nestjs/common/constants';
import { Type } from '@automock/types';
import { MetadataReflector, NestJSInjectable } from './types';
import { ClassCtorInjectables } from '@automock/common/src';
import { CustomToken, ParamsTokensReflector } from './params-token-resolver';

export class ClassCtorReflector {
  constructor(
    private reflector: MetadataReflector,
    private paramsTokensReflector: ParamsTokensReflector
  ) {}

  reflectInjectables(targetClass: Type): ClassCtorInjectables {
    const paramTypes = this.reflectParamTypes(targetClass);
    const paramTokens = this.reflectParamTokens(targetClass);

    const resolveParamTokenCb = this.paramsTokensReflector.resolveDependencyValue(paramTokens);

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

  private reflectParamTokens(targetClass: Type): CustomToken[] {
    return this.reflector.getMetadata(SELF_DECLARED_DEPS_METADATA, targetClass) || [];
  }

  private reflectParamTypes(targetClass: Type): (NestJSInjectable | undefined)[] {
    return this.reflector.getMetadata(PARAMTYPES_METADATA, targetClass) || [];
  }
}
