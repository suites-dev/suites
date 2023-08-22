import {
  ClassWithUndefinedDependency,
  ClassWithUndefinedDependencyProps,
  ConstructorBasedInjectionClass,
  ConstructorCombinedWithPropsClass,
  DependencyFive,
  DependencyOne,
  DependencySix,
  DependencyThree,
  DependencyTwo,
  PropsBasedMainClass,
} from './integration.assets';
import { UndefinedDependency, WithoutMetadata } from '@automock/common';
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
    const classDependencies = reflectorFactory.reflect(ConstructorBasedInjectionClass);

    it('should return a map of the class dependencies', () => {
      expect(classDependencies.list()).toStrictEqual<WithoutMetadata[]>([
        {
          identifier: DependencyOne,
          value: DependencyOne,
          type: 'PARAM',
        },
        {
          identifier: DependencyTwo,
          value: DependencyTwo,
          type: 'PARAM',
        },
        {
          identifier: DependencyThree,
          value: DependencyThree,
          type: 'PARAM',
        },
        {
          identifier: 'SOME_TOKEN_FROM_REF',
          value: DependencyFive,
          type: 'PARAM',
        },
        {
          identifier: DependencySix,
          value: UndefinedDependency,
          type: 'PARAM',
        },
        {
          identifier: 'CUSTOM_TOKEN',
          value: Object,
          type: 'PARAM',
        },
        {
          identifier: 'CUSTOM_TOKEN_SECOND',
          value: UndefinedDependency,
          type: 'PARAM',
        },
        {
          identifier: 'ANOTHER_CUSTOM_TOKEN',
          value: String,
          type: 'PARAM',
        },
        {
          identifier: 'LITERAL_VALUE_ARR',
          value: Array,
          type: 'PARAM',
        },
        {
          identifier: 'LITERAL_VALUE_STR',
          value: String,
          type: 'PARAM',
        },
      ]);
    });
  });

  describe('reflecting a class with property based injection', () => {
    const classDependencies = reflectorFactory.reflect(PropsBasedMainClass);

    it('should return an array of tuples with the class dependencies', () => {
      expect(classDependencies.list()).toStrictEqual<WithoutMetadata[]>([
        {
          type: 'PROPERTY',
          identifier: DependencyOne,
          value: DependencyOne,
          property: { key: 'dependencyOne' },
        },
        {
          type: 'PROPERTY',
          identifier: DependencyTwo,
          value: DependencyTwo,
          property: { key: 'dependencyTwo' },
        },
        {
          type: 'PROPERTY',
          identifier: DependencyThree,
          value: DependencyThree,
          property: { key: 'dependencyThree' },
        },
        {
          type: 'PROPERTY',
          identifier: DependencySix,
          value: UndefinedDependency,
          property: { key: 'dependencySix' },
        },
        {
          type: 'PROPERTY',
          identifier: 'CUSTOM_TOKEN',
          value: Object,
          property: { key: 'dependencyFour' },
        },
        {
          type: 'PROPERTY',
          identifier: DependencyFive,
          value: DependencyFive,
          property: { key: 'dependencyMissingWithToken' },
        },
        {
          type: 'PROPERTY',
          identifier: 'CUSTOM_TOKEN_SECOND',
          value: UndefinedDependency,
          property: { key: 'dependencyUndefinedWithToken' },
        },
        {
          type: 'PROPERTY',
          identifier: 'LITERAL_VALUE_ARR',
          value: Array,
          property: { key: 'literalValueArray' },
        },
        {
          type: 'PROPERTY',
          identifier: 'LITERAL_VALUE_STR',
          value: String,
          property: { key: 'literalValueString' },
        },
      ]);
    });
  });

  describe('reflecting a class with constructor and properties combined', () => {
    const classDependencies = reflectorFactory.reflect(ConstructorCombinedWithPropsClass).list();

    it('should return an array of tuples with the class dependencies', () => {
      expect(classDependencies).toEqual<WithoutMetadata[]>([
        {
          identifier: DependencyOne,
          value: DependencyOne,
          type: 'PARAM',
        },
        {
          identifier: DependencyTwo,
          value: DependencyTwo,
          type: 'PARAM',
        },
        {
          type: 'PROPERTY',
          identifier: 'CUSTOM_TOKEN',
          value: Object,
          property: { key: 'dependencyFour' },
        },
        {
          type: 'PROPERTY',
          identifier: 'LITERAL_VALUE_STR',
          value: String,
          property: { key: 'literalValueString' },
        },
        {
          type: 'PROPERTY',
          identifier: DependencyThree,
          value: DependencyThree,
          property: { key: 'dependencyThree' },
        },
      ]);
    });
  });

  describe('reflecting classes with undefined constructor dependencies', () => {
    it.each([[ClassWithUndefinedDependency], [ClassWithUndefinedDependencyProps]])(
      'should fail with an error indicating that the dependency is not defined',
      (type: Type) => {
        expect(() => reflectorFactory.reflect(type)).toThrow();
      }
    );
  });
});
