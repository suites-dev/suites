import { AutomockTestBuilder, TestBedBuilder } from '@automock/core';
import { Type } from '@automock/types';
import { createMock } from '@golevelup/ts-sinon';

export class TestBed {
  /**
   * @description Creates new test bed builder
   *
   * @param targetClass
   * @return TestBedBuilder
   */
  public static create<TClass = any>(targetClass: Type<TClass>): TestBedBuilder<TClass> {
    return AutomockTestBuilder<TClass>(createMock)(targetClass);
  }
}
