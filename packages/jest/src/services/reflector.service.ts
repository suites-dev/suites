import { ClassDependencies, Type } from '../types';
import { CustomToken, TokensReflector } from './token-reflector.module';

export class ReflectorService {
  private static readonly INJECTED_TOKENS_METADATA = 'self:paramtypes';
  private static readonly PARAM_TYPES_METADATA = 'design:paramtypes';

  public constructor(
    private readonly reflector: typeof Reflect,
    private readonly tokensReflector: TokensReflector
  ) {}

  public reflectDependencies(targetClass: Type): ClassDependencies {
    const types = this.reflectParamTypes(targetClass);
    const tokens = this.reflectParamTokens(targetClass);
    const classDependencies: ClassDependencies = new Map<Type | string, Type>();

    const callback = this.tokensReflector.attachTokenToDependency(tokens);

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
      .forEach((tuple) => {
        const [typeOrToken, type] = tuple;
        classDependencies.set(typeOrToken, type);
      });

    return classDependencies;
  }

  private reflectParamTokens(targetClass: Type): CustomToken[] {
    return this.reflector.getMetadata(ReflectorService.INJECTED_TOKENS_METADATA, targetClass) || [];
  }

  private reflectParamTypes(targetClass: Type): (Type | undefined)[] {
    return this.reflector.getMetadata(ReflectorService.PARAM_TYPES_METADATA, targetClass) || [];
  }
}
