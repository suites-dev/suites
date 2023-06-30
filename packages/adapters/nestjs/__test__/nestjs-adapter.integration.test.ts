import { ReflectorFactory } from '../src/reflector.service';
import { TokensReflector } from '../src/token-reflector.service';
import {
  DependencyFourToken,
  DependencyOne,
  DependencyThree,
  DependencyTwo,
  MainClass,
} from './integration.assets';
import { ClassDependenciesMap } from '@automock/common';

describe('NestJS Automock Adapter Integration Test', () => {
  describe('reflecting a class', () => {
    const reflectorFactory = ReflectorFactory(Reflect, TokensReflector);
    const classDependencies = reflectorFactory.reflectDependencies(MainClass);

    it('should return a map of the class dependencies', () => {
      expect(classDependencies.constructor).toStrictEqual<ClassDependenciesMap['constructor']>([
        [DependencyOne, DependencyOne],
        [DependencyTwo, DependencyTwo],
        [DependencyThree, DependencyThree],
        ['CUSTOM_TOKEN', DependencyFourToken],
        ['CUSTOM_TOKEN', String],
        ['LITERAL_VALUE_ARR', Array],
        ['LITERAL_VALUE_STR', String],
      ]);
    });
  });
});
