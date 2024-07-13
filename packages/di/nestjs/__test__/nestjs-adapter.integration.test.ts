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
} from './assets/integration.assets';
import { InjectableIdentifier, UndefinedDependency, WithoutMetadata } from '@suites/types.di';
import { Type } from '@suites/types.common';
import { adapter } from '../src';

describe('NestJS Suites DI Adapter Integration Test', () => {
  const dependencyInjectionAdapter = adapter;

  describe('reflecting a class with constructor based injection', () => {
    const injectablesContainer = dependencyInjectionAdapter.inspect(ConstructorBasedInjectionClass);

    it('should list the dependencies in the dependencies container corresponding to the class injectables', () => {
      expect(injectablesContainer.list()).toStrictEqual<WithoutMetadata[]>([
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

    describe('resolving dependencies from the container by identifiers and metadata keys and values', () => {
      it.each([
        [DependencyOne],
        [DependencyTwo],
        [DependencyThree],
        ['SOME_TOKEN_FROM_REF'],
        [DependencySix],
        ['CUSTOM_TOKEN'],
        ['CUSTOM_TOKEN_SECOND'],
        ['ANOTHER_CUSTOM_TOKEN'],
        ['LITERAL_VALUE_ARR'],
        ['LITERAL_VALUE_STR'],
      ])('%p should be defined', (identifier: InjectableIdentifier) => {
        const dependency = injectablesContainer.resolve(identifier);
        expect(dependency).toBeDefined();
      });
    });
  });

  describe('reflecting a class with property based injection', () => {
    const injectablesContainer = dependencyInjectionAdapter.inspect(PropsBasedMainClass);

    it('should list the dependencies in the dependencies container corresponding to the class injectables', () => {
      expect(injectablesContainer.list()).toStrictEqual<WithoutMetadata[]>([
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
          value: UndefinedDependency,
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

    describe('resolving dependencies from the container by identifiers and metadata keys and values', () => {
      it.each([
        [DependencyOne],
        [DependencyTwo],
        [DependencyThree],
        [DependencySix],
        ['CUSTOM_TOKEN'],
        [DependencyFive],
        ['CUSTOM_TOKEN_SECOND'],
        ['LITERAL_VALUE_ARR'],
        ['LITERAL_VALUE_STR'],
      ])('%p should be defined', (identifier: InjectableIdentifier) => {
        const dependency = injectablesContainer.resolve(identifier);
        expect(dependency).toBeDefined();
      });
    });
  });

  describe('reflecting a class with constructor and properties combined', () => {
    const injectablesContainer = dependencyInjectionAdapter.inspect(
      ConstructorCombinedWithPropsClass
    );

    it('should list the dependencies in the dependencies container corresponding to the class injectables', () => {
      expect(injectablesContainer.list()).toEqual<WithoutMetadata[]>([
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

    describe('resolving dependencies from the container by identifiers and metadata keys and values', () => {
      it.each([['CUSTOM_TOKEN'], ['LITERAL_VALUE_STR'], [DependencyThree]])(
        '%p should be defined',
        (identifier: InjectableIdentifier) => {
          const dependency = injectablesContainer.resolve(identifier);
          expect(dependency).toBeDefined();
        }
      );
    });
  });

  describe('reflecting classes with undefined constructor dependencies', () => {
    it.each([[ClassWithUndefinedDependency], [ClassWithUndefinedDependencyProps]])(
      'should fail with an error indicating that the dependency is not defined',
      (type: Type) => {
        expect(() => dependencyInjectionAdapter.inspect(type)).toThrow();
      }
    );
  });
});
