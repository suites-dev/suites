import { createStubInstance } from 'sinon';
import { Type } from '@automock/common';
import { UnitBuilder } from './sinon-unit-builder';

export class Spec {
  /**
   * Create new unit builder
   * @param targetClass
   * @return UnitBuilder<TClass>
   */
  public static createUnit<TClass = any>(targetClass: Type<TClass>): UnitBuilder<TClass> {
    return new UnitBuilder(targetClass, createStubInstance);
  }
}
