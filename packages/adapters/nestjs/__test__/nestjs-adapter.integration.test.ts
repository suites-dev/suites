import {
  DependencyOne,
  DependencyThree,
  DependencyTwo,
  ConstructorBasedInjectionClass,
  PropsBasedMainClass,
  ConstructorCombinedWithPropsClass,
  DependencyFive,
  DependencySix,
  ClassWithUndefinedDependency,
  ClassWithUndefinedDependencyProps,
} from './integration.assets';
import {
  ClassCtorInjectables,
  ClassDependenciesMap,
  ClassPropsInjectables,
  UndefinedDependency,
} from '@automock/common';
import { ParamsTokensReflector } from '../src/params-token-resolver';
import { ReflectorFactory } from '../src/class-reflector';
import { ClassPropsReflector } from '../src/class-props-reflector';
import { ClassCtorReflector } from '../src/class-ctor-reflector';
import { Type } from '@automock/types';
import { PropertyReflectionStrategies } from '../src/property-reflection-strategies.static';

describe('NestJS Automock Adapter Integration Test', () => {
  const reflectorFactory = ReflectorFactory(
    ClassPropsReflector(Reflect, PropertyReflectionStrategies),
    ClassCtorReflector(Reflect, ParamsTokensReflector)
  );

  describe('reflecting a class with constructor based injection', () => {
    const classDependencies = reflectorFactory.reflectDependencies(ConstructorBasedInjectionClass);

    it('should return a map of the class dependencies', () => {
      expect(classDependencies.constructor).toStrictEqual<ClassCtorInjectables>([
        [DependencyOne, DependencyOne],
        [DependencyTwo, DependencyTwo],
        [DependencyThree, DependencyThree],
        ['SOME_TOKEN_FROM_REF', DependencyFive],
        [DependencySix, DependencySix],
        ['CUSTOM_TOKEN', Object],
        ['CUSTOM_TOKEN_SECOND', UndefinedDependency],
        ['ANOTHER_CUSTOM_TOKEN', String],
        ['LITERAL_VALUE_ARR', Array],
        ['LITERAL_VALUE_STR', String],
      ]);
    });
  });

  describe('reflecting a class with property based injection', () => {
    const classDependencies = reflectorFactory.reflectDependencies(PropsBasedMainClass);

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
          property: 'dependencySix',
          typeOrToken: DependencySix,
          value: DependencySix,
        },
        {
          property: 'dependencyFour',
          typeOrToken: 'CUSTOM_TOKEN',
          value: Object,
        },
        {
          property: 'dependencyMissingWithToken',
          typeOrToken: DependencyFive,
          value: DependencyFive,
        },
        {
          property: 'dependencyUndefinedWithToken',
          typeOrToken: 'CUSTOM_TOKEN_SECOND',
          value: UndefinedDependency,
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

  describe('reflecting a class with constructor and properties combined', () => {
    const classDependencies = reflectorFactory.reflectDependencies(
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

  describe('reflecting classes with undefined constructor dependencies', () => {
    it.each([[ClassWithUndefinedDependency], [ClassWithUndefinedDependencyProps]])(
      'should fail with an error indicating that the dependency is not defined',
      (type: Type) => {
        expect(() => reflectorFactory.reflectDependencies(type)).toThrow();
      }
    );
  });
});
