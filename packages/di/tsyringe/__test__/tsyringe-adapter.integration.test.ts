import { ClassInjectable, InjectableIdentifier, UndefinedDependency } from '@automock/common';
import { Type } from '@automock/types';
import TSyringeAutomockDependenciesAdapter from '../src';
import {
  ClassWithUndefinedDependency,
  ConstructorBasedInjectionClass,
  DependencyFive,
  DependencyOne,
  DependencySix,
  DependencyThree,
  DependencyTwo,
} from './assets/integration.assets';

describe('TSyringe Automock Adapter Integration Test', () => {
  const dependenciesAdapter = TSyringeAutomockDependenciesAdapter;

  describe('reflecting a class with constructor based injection', () => {
    const injectablesContainer = dependenciesAdapter.inspect(ConstructorBasedInjectionClass);

    it('should list the dependencies in the dependencies container corresponding to the class injectables', () => {
      expect(injectablesContainer.list()).toStrictEqual<ClassInjectable[]>([
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

  describe('reflecting classes with undefined constructor dependencies', () => {
    it.each([[ClassWithUndefinedDependency]])(
      'should fail with an error indicating that the dependency is not defined',
      (type: Type) => {
        expect(() => dependenciesAdapter.inspect(type)).toThrow();
      }
    );
  });
});
