import { Type } from '@automock/common';
import { SpecBuilder } from '@automock/core';

export class Unit {
  /**
   * Creates new unit builder
   * @param targetClass
   * @return JestUnitBuilder<TClass>
   */
  public static create<TClass = any>(targetClass: Type<TClass>): SpecBuilder<TClass> {
    // return new UnitBuilder(targetClass, mock);
  }
}
