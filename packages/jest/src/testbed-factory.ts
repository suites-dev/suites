import { MockFactory } from '@automock/doubles.jest';
import { TestbedBuilder } from './services/testbed-resolver.service';
import { Type } from './types';
import { ReflectorService } from './services/reflector.service';
import { TokensReflector } from './services/token-reflector.service';

export class TestBed {
  /**
   * @description Create new testbed builder
   *
   * @param targetClass
   * @return TestbedBuilder
   */
  public static create<TClass = any>(targetClass: Type<TClass>): TestbedBuilder<TClass> {
    const reflector = new ReflectorService(Reflect, TokensReflector);
    return new TestbedBuilder<TClass>(reflector, MockFactory.create, targetClass);
  }
}
