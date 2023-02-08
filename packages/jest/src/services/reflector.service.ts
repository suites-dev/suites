import { ClassDependencies, CustomInjectableToken, Type, ConstructorParam } from '../types';

interface CustomToken {
  index: number;
  param: ConstructorParam;
}

export class ReflectorService {
  private static readonly INJECTED_TOKENS_METADATA = 'self:paramtypes';
  private static readonly PARAM_TYPES_METADATA = 'design:paramtypes';

  public constructor(private readonly reflector: typeof Reflect) {}

  public reflectDependencies(targetClass: Type): ClassDependencies {
    const classDependencies = new Map<Type | string, Type>();

    const types = this.reflectParamTypes(targetClass);
    const tokens = this.reflectParamTokens(targetClass);

    types.forEach((type, index) => {
      const token = ReflectorService.findToken(tokens, index);
      const isObjectType = type && type.name === 'Object';

      if (token) {
        const ref = ReflectorService.resolveRefFromToken(token);

        if (isObjectType) {
          if (typeof ref !== 'string') {
            classDependencies.set(ref, ref);
            return;
          }
        }

        if (type) {
          classDependencies.set(ref, type);
          return;
        }
      }

      if (type && !isObjectType) {
        classDependencies.set(type, type);
        return;
      }

      throw new Error(
        `'${targetClass.name}' is missing a token for the dependency at index [${index}], did you forget to inject it using @Inject()?`
      );
    });

    return classDependencies;
  }

  private reflectParamTokens(targetClass: Type): CustomToken[] {
    return this.reflector.getMetadata(ReflectorService.INJECTED_TOKENS_METADATA, targetClass) || [];
  }

  private reflectParamTypes(targetClass: Type): (Type | undefined)[] {
    return this.reflector.getMetadata(ReflectorService.PARAM_TYPES_METADATA, targetClass) || [];
  }

  private static findToken(list: CustomToken[], index: number): ConstructorParam | undefined {
    const record = list.find((element) => element.index === index);
    return record?.param;
  }

  private static resolveRefFromToken(token: CustomInjectableToken | Type): string | Type {
    return typeof token === 'object' && 'forwardRef' in token ? token.forwardRef() : token;
  }
}
