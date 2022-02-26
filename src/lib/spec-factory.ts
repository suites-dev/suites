import { mock } from 'jest-mock-extended';
import { UnitBuilder } from './unit-builder';
import { Type } from './types';
import { ReflectorService } from './reflector.service';

export class Spec {
  /**
   * Create new unit builder
   * @param targetClass
   * @return UnitBuilder
   */
  public static create<TClass = any>(targetClass: Type<TClass>): UnitBuilder<TClass> {
    const reflector = new ReflectorService(Reflect);

    return new UnitBuilder<TClass>(reflector, mock, targetClass);
  }
}
