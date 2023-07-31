import {
  DependencyOne,
  DependencyThree,
  DependencyTwo,
  ConstructorBasedInjectionClass,
  PropsBasedMainClass,
  ConstructorCombinedWithPropsClass,
} from './integration.assets';
import {
  ClassCtorInjectables,
  ClassDependenciesMap,
  ClassPropsInjectables,
} from '@automock/common';
import { ParamsTokensReflector } from '../src/params-token-resolver';
import { TsEDDependenciesReflector } from '../src/dependencies-reflector';
import { ClassPropsReflector } from '../src/class-props-reflector';
import { ClassCtorReflector } from '../src/class-ctor-reflector';

describe('TsED Automock Adapter Integration Test', () => {
  const dependenciesReflector = new TsEDDependenciesReflector(
    new ClassPropsReflector(Reflect),
    new ClassCtorReflector(Reflect, ParamsTokensReflector)
  );

  describe('reflecting a class with constructor based injection', () => {
    const classDependencies = dependenciesReflector.reflectDependencies(
      ConstructorBasedInjectionClass
    );

    it('should return a map of the class dependencies', () => {
      expect(classDependencies.constructor).toStrictEqual<ClassCtorInjectables>([
        [DependencyOne, DependencyOne],
        [DependencyTwo, DependencyTwo],
        // [DependencyThree, DependencyThree],
        // ['CUSTOM_TOKEN', Object],
        // ['ANOTHER_CUSTOM_TOKEN', String],
        // ['LITERAL_VALUE_ARR', Array],
        // ['LITERAL_VALUE_STR', String],
      ]);
    });
  });

  describe.skip('reflecting a class with property based injection', () => {
    const classDependencies = dependenciesReflector.reflectDependencies(PropsBasedMainClass);

    it('should return an array of tuples with the class dependencies', () => {
      expect(classDependencies.properties).toStrictEqual<ClassPropsInjectables>([
        {
          property: 'dependencyOne',
          typeOrToken: DependencyOne,
          value: DependencyOne,
        },
        {
          property: 'dependencyTwo',
          typeOrToken: DependencyTwo,
          value: DependencyTwo,
        },
        {
          property: 'dependencyThree',
          typeOrToken: DependencyThree,
          value: DependencyThree,
        },
        {
          property: 'dependencyFour',
          typeOrToken: 'CUSTOM_TOKEN',
          value: Object,
        },
        {
          property: 'literalValueArray',
          typeOrToken: 'LITERAL_VALUE_ARR',
          value: Array,
        },
        {
          property: 'literalValueString',
          typeOrToken: 'LITERAL_VALUE_STR',
          value: String,
        },
      ]);
    });
  });

  describe.skip('reflecting a class with constructor and properties combined', () => {
    const classDependencies = dependenciesReflector.reflectDependencies(
      ConstructorCombinedWithPropsClass
    );

    it('should return an array of tuples with the class dependencies', () => {
      expect(classDependencies).toEqual<ClassDependenciesMap>({
        constructor: [
          [DependencyOne, DependencyOne],
          [DependencyTwo, DependencyTwo],
        ],
        properties: [
          {
            property: 'dependencyFour',
            typeOrToken: 'CUSTOM_TOKEN',
            value: Object,
          },
          {
            property: 'literalValueString',
            typeOrToken: 'LITERAL_VALUE_STR',
            value: String,
          },
          {
            property: 'dependencyThree',
            typeOrToken: DependencyThree,
            value: DependencyThree,
          },
        ],
      });
    });
  });
});
