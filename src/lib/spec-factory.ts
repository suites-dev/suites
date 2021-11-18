import { mockDeep } from 'jest-mock-extended';
import { Reflector } from '@nestjs/core';
import { Type } from '@nestjs/common/interfaces';
import { DependenciesBuilder } from './dependencies-builder';

export class Spec {
  private static readonly reflector = new Reflector();

  public static createUnit<TClass = any>(targetClass: Type<TClass>): DependenciesBuilder<TClass> {
    return new DependenciesBuilder<TClass>(this.reflector, mockDeep, targetClass);
  }
}
