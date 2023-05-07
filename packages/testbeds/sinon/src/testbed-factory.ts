import { AutomockTestBuilder, MockFunction, TestBedBuilder } from '@automock/core';
import { Type } from '@automock/types';
import { MockFactory } from '@automock/doubles.sinon';

export class TestBed {
  /**
   * Creates a new TestBed builder
   *
   * @param targetClass
   * @return TestBedBuilder
   */
  public static create<TClass>(targetClass: Type<TClass>): TestBedBuilder<TClass> {
    return AutomockTestBuilder<TClass>(MockFactory.create as MockFunction<TClass>)(targetClass);
  }
}
