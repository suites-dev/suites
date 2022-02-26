import { Type } from './types';

export interface CustomToken {
  index: number;
  param: string;
}

export class ReflectorService {
  private static readonly INJECTED_TOKENS_METADATA = 'self:paramtypes';
  private static readonly PARAM_TYPES_METADATA = 'design:paramtypes';

  public constructor(private readonly reflector: typeof Reflect) {}

  public reflectDependencies(targetClass: Type): Map<string | Type<unknown>, Type<unknown>> {
    const classDependencies = new Map<string | Type<unknown>, Type<unknown>>();

    const types = this.reflectParamTypes(targetClass);
    const tokens = this.reflectParamTokens(targetClass);

    types.map((type: Type<unknown>, index: number) => {
      if (type.name === 'Object') {
        try {
          const token = ReflectorService.findToken(tokens, index);
          classDependencies.set(token, type);
        } catch (error) {
          throw new Error(
            `'${targetClass.name}' is missing a token for the dependency at index [${index}], did you forget to inject it using @Inject()?`
          );
        }
      } else {
        classDependencies.set(type, type);
      }
    });

    return classDependencies;
  }

  private reflectParamTokens(targetClass: Type): CustomToken[] {
    return this.reflector.getMetadata(ReflectorService.INJECTED_TOKENS_METADATA, targetClass) || [];
  }

  private reflectParamTypes(targetClass: Type): Type<unknown>[] {
    return this.reflector.getMetadata(ReflectorService.PARAM_TYPES_METADATA, targetClass) || [];
  }

  private static findToken(list: CustomToken[], index: number): string | never {
    const record = list.find((element) => element.index === index);

    if (!record) {
      throw new Error('Cannot find token');
    }

    return record.param;
  }
}
