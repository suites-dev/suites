import { Type } from '@automock/common';
import { SpecBuilder } from '@automock/core';

export class Unit {
  /**
   * Creates new unit builder
   * @param targetClass
   * @return SpecBuilder<TClass>
   */
  public static create<TClass = any>(targetClass: Type<TClass>): SpecBuilder<TClass> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const specBuilder = require('@automock/jest').default;

    const a = specBuilder(targetClass);

    return a;
  }
}
