import { Type } from '@automock/types';
import { ClassDependencies, ClassDependenciesMap } from '@automock/common';
import { DependenciesReflector as AutomockDependenciesReflector } from '@automock/common';
import { CustomToken, TokensReflector } from './token-reflector.service';

const INJECTED_TOKENS_METADATA = 'self:paramtypes';
const PARAM_TYPES_METADATA = 'design:paramtypes';

export function ReflectorFactory(
  reflector: typeof Reflect,
  tokensReflector: TokensReflector
): AutomockDependenciesReflector {
  function reflectDependencies(targetClass: Type): ClassDependenciesMap {
    const types = reflectParamTypes(targetClass);
    const tokens = reflectParamTokens(targetClass);
    const classDependencies: ClassDependencies = [];

    const callback = tokensReflector.attachTokenToDependency(tokens);

    types
      .map((typeOrUndefined, index) => {
        try {
          return callback(typeOrUndefined, index);
        } catch (error) {
          throw new Error(
            `'${targetClass.name}' is missing a token for the dependency at index [${index}], did you forget to inject it using @Inject()?`
          );
        }
      })
      .forEach((tuple) => classDependencies.push(tuple));

    return { constructor: classDependencies };
  }

  function reflectParamTokens(targetClass: Type): CustomToken[] {
    return reflector.getMetadata(INJECTED_TOKENS_METADATA, targetClass) || [];
  }

  function reflectParamTypes(targetClass: Type): (Type | undefined)[] {
    return reflector.getMetadata(PARAM_TYPES_METADATA, targetClass) || [];
  }

  return { reflectDependencies };
}
