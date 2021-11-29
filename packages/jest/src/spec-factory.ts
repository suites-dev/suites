import { mock } from 'jest-mock-extended';
import { Type } from '@aromajs/common';
import { UnitBuilder } from './jest-unit-builder';

export class Spec {
  /**
   * Create new unit builder
   * @param targetClass
   * @return UnitBuilder<TClass>
   */
  public static createUnit<TClass = any>(targetClass: Type<TClass>): UnitBuilder<TClass> {
    return new UnitBuilder(Reflect, targetClass, mock);
  }
}
