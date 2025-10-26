import 'reflect-metadata';
import type { ClassMetadata } from '@inversifyjs/core';
import { ClassPropsReflector, type PropertyMetadataReader } from './class-props-reflector';
import { IdentifierBuilder } from './identifier-builder.static';
import { UndefinedDependency, UndefinedDependencyError } from '@suites/types.di';
import type { Type } from '@suites/types.common';

describe('ClassPropsReflector Unit Tests', () => {
  function createMetadataReaderStub(
    classMetadata: ClassMetadata,
    propertyTypeMap: Map<string | symbol, Type | undefined> = new Map()
  ): PropertyMetadataReader {
    return {
      getClassMetadata: () => classMetadata,
      getPropertyType: (_target, propertyKey) => propertyTypeMap.get(propertyKey),
    };
  }

  describe('Error Handling', () => {
    it('should throw UndefinedDependencyError when property has no metadata and no TypeScript type', () => {
      class TestClass {
        property: any;
      }

      const propertyKey = 'property';
      const metadataReader = createMetadataReaderStub({
        constructorArguments: [],
        properties: new Map([[propertyKey, undefined as any]]),
        lifecycle: {
          postConstructMethodName: undefined,
          preDestroyMethodName: undefined,
        },
        scope: undefined,
      });

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);

      expect(() => classPropsReflector.reflectInjectables(TestClass)).toThrow(
        UndefinedDependencyError
      );
      expect(() => classPropsReflector.reflectInjectables(TestClass)).toThrow(
        /Suites encountered an error while attempting to detect a token or type/
      );
    });

    it('should include property name in error message', () => {
      class TestClass {
        mySpecialProperty: any;
      }

      const propertyKey = 'mySpecialProperty';
      const metadataReader = createMetadataReaderStub({
        constructorArguments: [],
        properties: new Map([[propertyKey, undefined as any]]),
        lifecycle: {
          postConstructMethodName: undefined,
          preDestroyMethodName: undefined,
        },
        scope: undefined,
      });

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);

      expect(() => classPropsReflector.reflectInjectables(TestClass)).toThrow(
        /mySpecialProperty/
      );
    });

    it('should include class name in error message', () => {
      class MyAwesomeClass {
        property: any;
      }

      const propertyKey = 'property';
      const metadataReader = createMetadataReaderStub({
        constructorArguments: [],
        properties: new Map([[propertyKey, undefined as any]]),
        lifecycle: {
          postConstructMethodName: undefined,
          preDestroyMethodName: undefined,
        },
        scope: undefined,
      });

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);

      expect(() => classPropsReflector.reflectInjectables(MyAwesomeClass)).toThrow(
        /MyAwesomeClass/
      );
    });
  });

  describe('Empty Properties', () => {
    it('should return empty array when class has no injectable properties', () => {
      class TestClass {}

      const metadataReader = createMetadataReaderStub({
        constructorArguments: [],
        properties: new Map(),
        lifecycle: {
          postConstructMethodName: undefined,
          preDestroyMethodName: undefined,
        },
        scope: undefined,
      });

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);
      const result = classPropsReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle properties map with zero size', () => {
      class TestClass {
        regularProperty = 'not injectable';
      }

      const metadataReader = createMetadataReaderStub({
        constructorArguments: [],
        properties: new Map(),
        lifecycle: {
          postConstructMethodName: undefined,
          preDestroyMethodName: undefined,
        },
        scope: undefined,
      });

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);
      const result = classPropsReflector.reflectInjectables(TestClass);

      expect(result).toEqual([]);
    });
  });

  describe('Symbol Property Keys', () => {
    it('should handle Symbol property keys correctly', () => {
      const symbolKey = Symbol('myProperty');

      class TestClass {
        [symbolKey]: any;
      }

      class Dependency {}

      const propertyTypeMap = new Map<string | symbol, Type>([[symbolKey, Dependency]]);
      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [],
          properties: new Map([
            [
              symbolKey,
              {
                kind: 1,
                value: 'SERVICE_ID',
                optional: false,
                name: undefined,
                tags: new Map(),
              } as any,
            ],
          ]),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        propertyTypeMap
      );

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);
      const result = classPropsReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(1);
      expect(result[0].property?.key).toBe(symbolKey);
      expect(result[0].identifier).toBe('SERVICE_ID');
    });

    it('should include Symbol key in error message', () => {
      const symbolKey = Symbol('testProperty');

      class TestClass {
        [symbolKey]: any;
      }

      const metadataReader = createMetadataReaderStub({
        constructorArguments: [],
        properties: new Map([[symbolKey, undefined as any]]),
        lifecycle: {
          postConstructMethodName: undefined,
          preDestroyMethodName: undefined,
        },
        scope: undefined,
      });

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);

      expect(() => classPropsReflector.reflectInjectables(TestClass)).toThrow(
        UndefinedDependencyError
      );
    });
  });

  describe('setValue Logic', () => {
    it('should use propertyParamType when available', () => {
      class Dependency {}
      class TestClass {
        property: Dependency;
      }

      const propertyTypeMap = new Map<string | symbol, Type>([['property', Dependency]]);
      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [],
          properties: new Map([
            [
              'property',
              {
                kind: 1,
                value: 'SERVICE_ID',
                optional: false,
                name: undefined,
                tags: new Map(),
              } as any,
            ],
          ]),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        propertyTypeMap
      );

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);
      const result = classPropsReflector.reflectInjectables(TestClass);

      expect(result[0].value).toBe(Dependency);
    });

    it('should use identifier as value when propertyParamType is undefined and identifier is function', () => {
      class ServiceClass {}
      class TestClass {
        property: any;
      }

      const metadataReader = createMetadataReaderStub({
        constructorArguments: [],
        properties: new Map([
          [
            'property',
            {
              kind: 1,
              value: ServiceClass,
              optional: false,
              name: undefined,
              tags: new Map(),
            } as any,
          ],
        ]),
        lifecycle: {
          postConstructMethodName: undefined,
          preDestroyMethodName: undefined,
        },
        scope: undefined,
      });

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);
      const result = classPropsReflector.reflectInjectables(TestClass);

      expect(result[0].value).toBe(ServiceClass);
    });

    it('should use UndefinedDependency when propertyParamType is undefined and identifier is not function', () => {
      class TestClass {
        property: any;
      }

      const metadataReader = createMetadataReaderStub({
        constructorArguments: [],
        properties: new Map([
          [
            'property',
            {
              kind: 1,
              value: 'STRING_TOKEN',
              optional: false,
              name: undefined,
              tags: new Map(),
            } as any,
          ],
        ]),
        lifecycle: {
          postConstructMethodName: undefined,
          preDestroyMethodName: undefined,
        },
        scope: undefined,
      });

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);
      const result = classPropsReflector.reflectInjectables(TestClass);

      expect(result[0].value).toBe(UndefinedDependency);
    });
  });

  describe('Normal Flow with Decorators', () => {
    it('should correctly reflect properties with inject decorators', () => {
      class Dependency {}
      class TestClass {
        property: Dependency;
      }

      const propertyTypeMap = new Map<string | symbol, Type>([['property', Dependency]]);
      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [],
          properties: new Map([
            [
              'property',
              {
                kind: 1,
                value: 'SERVICE_ID',
                optional: false,
                name: undefined,
                tags: new Map(),
              } as any,
            ],
          ]),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        propertyTypeMap
      );

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);
      const result = classPropsReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        metadata: undefined,
        identifier: 'SERVICE_ID',
        type: 'PROPERTY',
        value: Dependency,
        property: { key: 'property' },
      });
    });

    it('should handle multiple properties with various decorators', () => {
      class Dep1 {}
      class Dep2 {}
      class Dep3 {}
      class TestClass {
        prop1: Dep1;
        prop2: Dep2;
        prop3: Dep3;
      }

      const propertyTypeMap = new Map<string | symbol, Type>([
        ['prop1', Dep1],
        ['prop2', Dep2],
        ['prop3', Dep3],
      ]);

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [],
          properties: new Map([
            [
              'prop1',
              {
                kind: 1,
                value: 'TOKEN1',
                optional: false,
                name: 'named1',
                tags: new Map(),
              } as any,
            ],
            [
              'prop2',
              {
                kind: 0,
                value: 'TOKEN2',
                optional: false,
                name: undefined,
                tags: new Map([['tag', 'value']]),
                chained: false,
              } as any,
            ],
            [
              'prop3',
              {
                kind: 2, // unmanaged
              } as any,
            ],
          ]),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        propertyTypeMap
      );

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);
      const result = classPropsReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(3);
      expect('metadata' in result[0] ? result[0].metadata : undefined).toEqual({ name: 'named1' });
      expect(result[0].property?.key).toBe('prop1');
      expect('metadata' in result[1] ? result[1].metadata : undefined).toEqual({ tag: 'value' });
      expect(result[1].property?.key).toBe('prop2');
      expect('metadata' in result[2] ? result[2].metadata : undefined).toBeUndefined();
      expect(result[2].property?.key).toBe('prop3');
    });

    it('should handle properties with no metadata but valid TypeScript types', () => {
      class Dependency {}
      class TestClass {
        property: Dependency;
      }

      const propertyTypeMap = new Map<string | symbol, Type>([['property', Dependency]]);
      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [],
          properties: new Map([
            [
              'property',
              {
                kind: 1,
                value: Dependency,
                optional: false,
                name: undefined,
                tags: new Map(),
              } as any,
            ],
          ]),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        propertyTypeMap
      );

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);
      const result = classPropsReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(1);
      expect(result[0].identifier).toBe(Dependency);
      expect(result[0].value).toBe(Dependency);
    });
  });

  describe('Edge Cases', () => {
    it('should handle properties with string keys', () => {
      class Dependency {}
      class TestClass {
        'string-key': Dependency;
      }

      const propertyTypeMap = new Map<string | symbol, Type>([['string-key', Dependency]]);
      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [],
          properties: new Map([
            [
              'string-key',
              {
                kind: 1,
                value: 'SERVICE_ID',
                optional: false,
                name: undefined,
                tags: new Map(),
              } as any,
            ],
          ]),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        propertyTypeMap
      );

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);
      const result = classPropsReflector.reflectInjectables(TestClass);

      expect(result[0].property?.key).toBe('string-key');
    });

    it('should create new instance for each property reflection', () => {
      class Dependency {}
      class TestClass {
        prop1: Dependency;
        prop2: Dependency;
      }

      const propertyTypeMap = new Map<string | symbol, Type>([
        ['prop1', Dependency],
        ['prop2', Dependency],
      ]);

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [],
          properties: new Map([
            [
              'prop1',
              {
                kind: 1,
                value: 'TOKEN',
                optional: false,
                name: undefined,
                tags: new Map(),
              } as any,
            ],
            [
              'prop2',
              {
                kind: 1,
                value: 'TOKEN',
                optional: false,
                name: undefined,
                tags: new Map(),
              } as any,
            ],
          ]),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        propertyTypeMap
      );

      const classPropsReflector = ClassPropsReflector(IdentifierBuilder(), metadataReader);
      const result = classPropsReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toBe(result[1]);
    });
  });
});
