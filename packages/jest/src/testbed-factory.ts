import { mock } from 'jest-mock-extended';
import { TestbedResolver } from './services/testbed-resolver.service';
import { Type } from './types';
import { ReflectorService } from './services/reflector.service';

export class TestBed {
  /**
   * @description Create new testbed builder
   *
   * @param targetClass
   * @return TestbedResolver
   */
  public static create<TClass = any>(targetClass: Type<TClass>): TestbedResolver<TClass> {
    const reflector = new ReflectorService(Reflect);

    return new TestbedResolver<TClass>(reflector, mock, targetClass);
  }
}
