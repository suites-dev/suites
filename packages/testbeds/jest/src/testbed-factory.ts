import { AutomockTestBuilder, TestBedBuilder } from '@automock/core';
import { Type } from '@automock/types';
import { mock } from './mock.static';

export class TestBed {
  /**
   * @description Creates new test bed builder
   *
   * @param targetClass
   * @return TestBedBuilder
   */
  public static create<TClass = any>(targetClass: Type<TClass>): TestBedBuilder<TClass> {
    return AutomockTestBuilder<TClass>(mock)(targetClass);
  }
}
