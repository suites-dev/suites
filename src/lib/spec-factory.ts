import { mock } from 'jest-mock-extended';
import { UnitBuilder } from './unit-builder';
import { Type } from './types';

export class Spec {
  /**
   * Create new unit builder
   * @param targetClass
   * @return UnitBuilder
   */
  public static createUnit<TClass = any>(targetClass: Type<TClass>): UnitBuilder<TClass> {
    return new UnitBuilder<TClass>(Reflect, mock, targetClass);
  }
}
