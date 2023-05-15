import { AutomockTestBuilder, TestBedBuilder } from '@automock/core';
import { MockFactory } from '@automock/doubles.jest';
import { Type } from '@automock/types';

export class TestBed {
  /**
   * @description Creates new test bed builder
   *
   * @param targetClass
   * @return TestBedBuilder
   */
  public static create<TClass>(targetClass: Type<TClass>): TestBedBuilder<TClass> {
    return AutomockTestBuilder<TClass>(MockFactory.create)(targetClass);
  }
}
