import { createStubInstance } from 'sinon';
import { AutomockTestBuilder, MockFunction, TestBedBuilder } from '@automock/core';
import { Type } from '@automock/types';

export class TestBed {
  /**
   * @description Create new testbed builder
   *
   * @param targetClass
   * @return TestbedResolver
   */
  public static create<TClass>(targetClass: Type<TClass>): TestBedBuilder<TClass> {
    return AutomockTestBuilder<TClass>(createStubInstance as MockFunction<TClass>)(targetClass);
  }
}
