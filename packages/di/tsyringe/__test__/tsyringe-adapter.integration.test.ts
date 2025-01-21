import { ClassInjectable, InjectableIdentifier, UndefinedDependency } from '@suites/types.di';
import { Type } from '@suites/types.common';
import { adapter } from '../src';
import {
  ClassWithUndefinedDependency,
  ConstructorBasedInjectionClass,
  DependencyFive,
  DependencyOne,
  DependencySix,
  DependencyThree,
  DependencyTwo,
  SymbolToken,
} from './assets/integration.assets';

describe('TSyringe Automock Adapter Integration Test', () => {
  const dependenciesAdapter = adapter;

  describe('reflecting a class with constructor based injection', () => {
    const injectablesContainer = dependenciesAdapter.inspect(ConstructorBasedInjectionClass);

    it('should list the dependencies in the dependencies container corresponding to the class injectables', () => {
      expect(injectablesContainer.list()).toStrictEqual<ClassInjectable[]>([
        {
          identifier: DependencyOne,
          metadata: undefined,
          value: DependencyOne,
          type: 'PARAM',
        },
        {
          identifier: DependencyTwo,
          metadata: undefined,
          value: DependencyTwo,
          type: 'PARAM',
        },
        {
          identifier: DependencyThree,
          metadata: undefined,
          value: DependencyThree,
          type: 'PARAM',
        },
        {
          identifier: DependencySix,
          metadata: undefined,
          value: DependencySix,
          type: 'PARAM',
        },
        {
          identifier: SymbolToken,
          metadata: undefined,
          value: UndefinedDependency,
          type: 'PARAM',
        },
        {
          identifier: 'CUSTOM_TOKEN_SECOND',
          metadata: undefined,
          value: UndefinedDependency,
          type: 'PARAM',
        },
        {
          identifier: 'ANOTHER_CUSTOM_TOKEN',
          metadata: undefined,
          value: String,
          type: 'PARAM',
        },
        {
          identifier: 'LITERAL_VALUE_ARR',
          metadata: undefined,
          value: Array,
          type: 'PARAM',
        },
        {
          identifier: 'LITERAL_VALUE_STR',
          metadata: undefined,
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
