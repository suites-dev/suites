import { mock } from 'jest-mock-extended';
import { UnitResolver } from './unit-resolver';
import { Type } from './types';
import { ReflectorService } from './reflector.service';

export class Spec {
  /**
   * Create new unit builder
   * @param targetClass
   * @return UnitResolver
   */
  public static create<TClass = any>(targetClass: Type<TClass>): UnitResolver<TClass> {
    const reflector = new ReflectorService(Reflect);

    return new UnitResolver<TClass>(reflector, mock, targetClass);
  }
}
