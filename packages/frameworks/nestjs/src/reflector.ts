import { SELF_DECLARED_DEPS_METADATA, PARAMTYPES_METADATA } from '@nestjs/common/constants';
import { ClassReflectorAbstract, DependenciesMap } from '@automock/reflect';
import { Type } from '@automock/common';

interface NestCustomToken {
  index: number;
  param: string;
}

export class NestJSClassReflector extends ClassReflectorAbstract {
  private static readonly INJECTED_TOKENS_METADATA = SELF_DECLARED_DEPS_METADATA;
  private static readonly PARAM_TYPES_METADATA = PARAMTYPES_METADATA;

  public constructor(reflector: typeof Reflect, targetClass: Type<unknown>) {
    super(reflector, targetClass);
  }

  private reflectParamTokens(): NestCustomToken[] {
    return this.reflector.getMetadata(NestJSClassReflector.INJECTED_TOKENS_METADATA, this.targetClass) || [];
  }

  private reflectParamTypes(): Type<unknown>[] {
    return this.reflector.getMetadata(NestJSClassReflector.PARAM_TYPES_METADATA, this.targetClass) || [];
  }

  private static findToken(list: NestCustomToken[], index: number): string | never {
    const record = list.find((element) => element.index === index);

    if (!record) {
      throw new Error('Cannot find token');
    }

    return record.param;
  }

  protected reflectDependencies(): DependenciesMap {
    const classDependencies = new Map<string | Type<unknown>, Type<unknown>>();

    const types = this.reflectParamTypes();
    const tokens = this.reflectParamTokens();

    types.map((type: Type<unknown>, index: number) => {
      if (type.name === 'Object') {
        try {
          const token = NestJSClassReflector.findToken(tokens, index);
          classDependencies.set(token, type);
        } catch (error) {
          console.warn(
            `'${this.targetClass}' is missing a token for dependency at index [${index}], did you forget to inject it using @Inject()?`
          );
        }
      } else {
        classDependencies.set(type, type);
      }
    });

    return classDependencies;
  }
}
