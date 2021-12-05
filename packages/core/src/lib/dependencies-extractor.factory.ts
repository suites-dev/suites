import { ClassReflectorAbstract } from '@automock/reflect';
import { Type } from '@automock/common';
import { NestJSClassReflector } from '@automock/nestjs';

export class DependenciesExtractorFactory {
  public static create(targetClass: Type<unknown>): ClassReflectorAbstract {
    return new NestJSClassReflector(Reflect, targetClass);
  }
}
