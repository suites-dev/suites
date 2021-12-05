import { Type } from '@automock/common';
import { mock } from 'jest-mock-extended';
import { UnitBuilder } from './jest-unit-builder';

export class Spec {
  /**
   * Creates new unit builder
   * @param targetClass
   * @return UnitBuilder<TClass>
   */
  public static createUnit<TClass = any>(targetClass: Type<TClass>): UnitBuilder<TClass> {
    return new UnitBuilder(targetClass, mock);
  }
}
