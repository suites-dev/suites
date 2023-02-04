import { mock } from 'jest-mock-extended';
import { TestBedResolver } from './test-bed-resolver';
import { Type } from './types';
import { ReflectorService } from './reflector.service';

export class TestBed {
  /**
   * Create new unit builder
   * @param targetClass
   * @return TestBedResolver
   */
  public static create<TClass = any>(targetClass: Type<TClass>): TestBedResolver<TClass> {
    const reflector = new ReflectorService(Reflect);

    return new TestBedResolver<TClass>(reflector, mock, targetClass);
  }
}
