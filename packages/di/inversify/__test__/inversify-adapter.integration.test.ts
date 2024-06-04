import 'reflect-metadata';
import {
  ConstructorBasedInjectionClass,
  ConstructorCombinedWithPropsClass,
  DependencyEight,
  DependencyFive,
  DependencyFour,
  DependencyNine,
  DependencyOne,
  DependencySeven,
  DependencySix,
  DependencyTen,
  DependencyThree,
  DependencyTwo,
  PropertiesBasedInjectionClass,
  SymbolToken,
} from './assets/integration.assets';
import {
  InjectableRegistry,
  IdentifierMetadata,
  InjectableIdentifier,
  UndefinedDependency,
} from '@suites/types.di';
import { InversifyInjectableIdentifierMetadata } from '../src/types';
import { adapter } from '../src';

describe('InversifyJS Suites DI Adapter Integration Test', () => {
  const dependenciesAdapter = adapter;

  describe('class constructor injection', () => {
    let injectablesRegistry: InjectableRegistry;

    beforeAll(() => {
      injectablesRegistry = dependenciesAdapter.inspect(ConstructorBasedInjectionClass);
    });

    describe('reflecting a class with constructor based injection', () => {
      it('should list the dependencies in the dependencies container corresponding to the class injectables', () => {
        expect(injectablesRegistry.list()).toStrictEqual<InversifyInjectableIdentifierMetadata[]>([
          {
            identifier: 'Interface',
            metadata: { name: 'dependencyOne' } as never,
            value: DependencyOne,
            type: 'PARAM',
          },
          {
            metadata: undefined,
            identifier: DependencyTwo,
            value: DependencyTwo,
            type: 'PARAM',
          },
          {
            identifier: 'Interface',
            value: DependencyFive,
            metadata: { name: 'dependencyFive' } as never,
            type: 'PARAM',
          },
          {
            identifier: 'CUSTOM_TOKEN',
            metadata: { canThrow: true } as never,
            value: DependencyFour,
            type: 'PARAM',
          },
          {
            identifier: DependencySix,
            metadata: { tagged: 'withValue' } as never,
            value: DependencySix,
            type: 'PARAM',
          },
          {
            identifier: DependencySeven,
            metadata: undefined,
            value: DependencySeven,
            type: 'PARAM',
          },
          {
            identifier: 'CUSTOM_TOKEN_SECOND',
            metadata: undefined,
            value: UndefinedDependency,
            type: 'PARAM',
          },
          {
            identifier: SymbolToken,
            value: String,
            metadata: undefined,
            type: 'PARAM',
          },
          {
            identifier: 'LITERAL_VALUE_ARR',
            value: Array,
            metadata: undefined,
            type: 'PARAM',
          },
          {
            identifier: 'LITERAL_VALUE_STR',
            metadata: undefined,
            value: String,
            type: 'PARAM',
          },
          {
            identifier: DependencyEight,
            metadata: {
              named: 'arbitrary-name',
            } as never,
            type: 'PARAM',
            value: DependencyEight,
          },
          {
            identifier: DependencyNine,
            metadata: {
              unmanaged: true,
            } as never,
            type: 'PARAM',
            value: DependencyNine,
          },
          {
            identifier: DependencyTen,
            metadata: { canThrow: true } as never,
            type: 'PARAM',
            value: String,
          },
        ]);
      });
    });

    describe('resolving dependencies from the container by identifiers and metadata keys and values', () => {
      it.each([
        ['Interface', { name: 'dependencyOne' } as never],
        [DependencyTwo, undefined],
        ['Interface', { name: 'dependencyFive' } as never],
        ['CUSTOM_TOKEN', { canThrow: true } as never],
        [DependencySix, { tagged: 'withValue' } as never],
        [DependencySeven, undefined],
        ['CUSTOM_TOKEN_SECOND', undefined],
        [SymbolToken, undefined],
        ['LITERAL_VALUE_ARR', undefined],
        ['LITERAL_VALUE_STR', undefined],
        [DependencyTen, undefined],
      ])(
        '%p should be defined',
        (identifier: InjectableIdentifier, metadata: IdentifierMetadata | undefined) => {
          const dependency = injectablesRegistry.resolve(identifier, metadata);
          expect(dependency).toBeDefined();
        }
      );
    });
  });

  describe('class properties injection', () => {
    let injectablesRegistry: InjectableRegistry;

    beforeAll(() => {
      injectablesRegistry = dependenciesAdapter.inspect(PropertiesBasedInjectionClass);
    });

    describe('reflecting a class with property based injection', () => {
      it('should list the dependencies in the dependencies container corresponding to the class injectable', () => {
        expect(injectablesRegistry.list()).toStrictEqual<InversifyInjectableIdentifierMetadata[]>([
          {
            type: 'PROPERTY',
            metadata: undefined,
            identifier: 'Interface',
            value: DependencyOne,
            property: { key: 'dependencyOne' },
          },
          {
            type: 'PROPERTY',
            metadata: { canThrow: true } as never,
            identifier: 'CUSTOM_TOKEN',
            value: DependencyFour,
            property: { key: 'dependencyFour' },
          },
          {
            type: 'PROPERTY',
            metadata: undefined,
            identifier: DependencyThree,
            value: DependencyThree,
            property: { key: 'dependencyThree' },
          },
          {
            type: 'PROPERTY',
            metadata: { tagged: 'withValue' } as never,
            identifier: DependencySix,
            value: DependencySix,
            property: { key: 'dependencySix' },
          },
          {
            type: 'PROPERTY',
            metadata: undefined,
            identifier: 'CUSTOM_TOKEN_SECOND',
            value: UndefinedDependency,
            property: { key: 'dependencyMissingWithToken' },
          },
          {
            type: 'PROPERTY',
            metadata: undefined,
            identifier: 'ANOTHER_CUSTOM_TOKEN',
            value: String,
            property: { key: 'dummy' },
          },
          {
            type: 'PROPERTY',
            metadata: undefined,
            identifier: SymbolToken,
            value: Array,
            property: { key: 'literalValueArray' },
          },
          {
            type: 'PROPERTY',
            metadata: undefined,
            identifier: 'LITERAL_VALUE_STR',
            value: String,
            property: { key: 'literalValueString' },
          },
        ]);
      });
    });

    describe('resolving dependencies from the container by identifiers and metadata keys and values', () => {
      it.each([
        ['Interface', undefined],
        ['CUSTOM_TOKEN', { canThrow: true } as never],
        [DependencyThree, undefined],
        [DependencySix, { tagged: 'withValue' } as never],
        ['CUSTOM_TOKEN_SECOND', undefined],
        [SymbolToken, undefined],
        [SymbolToken, undefined],
        ['LITERAL_VALUE_STR', undefined],
      ])(
        '%p should be defined',
        (identifier: InjectableIdentifier, metadata: IdentifierMetadata | undefined) => {
          const dependency = injectablesRegistry.resolve(identifier, metadata);
          expect(dependency).toBeDefined();
        }
      );
    });
  });

  describe('class constructor and properties combined', () => {
    const injectablesRegistry = dependenciesAdapter
      .inspect(ConstructorCombinedWithPropsClass)
      .list();

    it('should return an array of tuples with the class dependencies', () => {
      expect(injectablesRegistry).toEqual<InversifyInjectableIdentifierMetadata[]>([
        {
          metadata: undefined,
          identifier: DependencyOne,
          value: DependencyOne,
          type: 'PARAM',
        },
        {
          metadata: undefined,
          identifier: DependencyTwo,
          value: DependencyTwo,
          type: 'PARAM',
        },
        {
          metadata: undefined,
          type: 'PROPERTY',
          identifier: 'CUSTOM_TOKEN',
          value: Object,
          property: { key: 'dependencyFour' },
        },
        {
          metadata: undefined,
          type: 'PROPERTY',
          identifier: 'LITERAL_VALUE_STR',
          value: String,
          property: { key: 'literalValueString' },
        },
        {
          metadata: undefined,
          type: 'PROPERTY',
          identifier: DependencyThree,
          value: Object,
          property: { key: 'dependencyThree' },
        },
      ]);
    });
  });
});
