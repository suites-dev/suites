import { ClassReflector } from '@automock/reflect';
import { Type } from '@automock/common';

export class DependenciesExtractorFactory {
  public static create(targetClass: Type<unknown>): ClassReflector {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const reflector = require('@automock/nestjs').default as Type<ClassReflector>;

    return new reflector(Reflect, targetClass);
  }
}
