import { mock } from 'jest-mock-extended';
import { Reflector } from '@nestjs/core';
import { Type } from '@nestjs/common/interfaces';
import { UnitBuilder } from './unit-builder';

export class Spec {
  private static readonly reflector = new Reflector();

  /**
   * Create new unit builder
   * @param targetClass
   * @return UnitBuilder
   */
  public static createUnit<TClass = any>(targetClass: Type<TClass>): UnitBuilder<TClass> {
    return new UnitBuilder<TClass>(this.reflector, mock, targetClass);
  }
}
