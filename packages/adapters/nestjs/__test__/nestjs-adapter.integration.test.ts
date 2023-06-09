import { ReflectorFactory } from '../src/reflector.service';
import { TokensReflector } from '../src/token-reflector.service';
import {
  DependencyFourToken,
  DependencyOne,
  DependencyThree,
  DependencyTwo,
  MainClass,
} from './integration.assets';
import { Type } from '@automock/types';
import { ClassDependencies, PrimitiveValue } from '@automock/common';

describe('NestJS Automock Adapter Integration Test', () => {
  describe('reflecting a class', () => {
    const reflectorFactory = ReflectorFactory(Reflect, TokensReflector);
    const classDependencies = reflectorFactory.reflectDependencies(MainClass);

    it('should return a map of the class dependencies', () => {
      expect(classDependencies).toStrictEqual<ClassDependencies>(
        new Map<Type | string, PrimitiveValue | Type>([
          ['CUSTOM_TOKEN', DependencyFourToken],
          [DependencyOne, DependencyOne],
          [DependencyTwo, DependencyTwo],
          [DependencyThree, DependencyThree],
          ['LITERAL_VALUE_ARR', Array],
          ['LITERAL_VALUE_STR', String],
        ])
      );
    });
  });
});
