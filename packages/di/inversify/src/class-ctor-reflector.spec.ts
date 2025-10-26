import 'reflect-metadata';
import type { ClassMetadata } from '@inversifyjs/core';
import { ClassCtorReflector, type MetadataReader } from './class-ctor-reflector';
import { IdentifierBuilder } from './identifier-builder.static';
import { UndefinedDependencyError } from '@suites/types.di';
import type { Type } from '@suites/types.common';

/* eslint-disable @typescript-eslint/no-unused-vars */

describe('ClassCtorReflector Unit Tests', () => {
  function createMetadataReaderStub(
    classMetadata: ClassMetadata,
    paramTypes?: (Type | undefined)[] | undefined
  ): MetadataReader {
    return {
      getClassMetadata: () => classMetadata,
      // @ts-expect-error - Test stub intentionally allows undefined in array for error testing
      getParamTypes: () => paramTypes,
    };
  }

  describe('Error Handling', () => {
    it('should throw UndefinedDependencyError when parameter has no metadata and no TypeScript type', () => {
      class TestClass {
        constructor(dependency: any) {}
      }

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [undefined as any],
          properties: new Map(),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        [undefined]
      );

      const classCtorReflector = ClassCtorReflector(IdentifierBuilder(), metadataReader);

      expect(() => classCtorReflector.reflectInjectables(TestClass)).toThrow(
        UndefinedDependencyError
      );
      expect(() => classCtorReflector.reflectInjectables(TestClass)).toThrow(
        /Suites encountered an error while attempting to detect a token or type/
      );
    });

    it('should include parameter index in error message', () => {
      class TestClass {
        constructor(dep1: string, dep2: any, dep3: string) {}
      }

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [
            { kind: 1, value: 'dep1', optional: false, tags: new Map() } as any,
            undefined as any,
            { kind: 1, value: 'dep3', optional: false, tags: new Map() } as any,
          ],
          properties: new Map(),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        [String, undefined, String]
      );

      const classCtorReflector = ClassCtorReflector(IdentifierBuilder(), metadataReader);

      expect(() => classCtorReflector.reflectInjectables(TestClass)).toThrow(/index \[1\]/);
    });

    it('should include class name in error message', () => {
      class MySpecialClass {
        constructor(dependency: any) {}
      }

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [undefined as any],
          properties: new Map(),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        [undefined]
      );

      const classCtorReflector = ClassCtorReflector(IdentifierBuilder(), metadataReader);

      expect(() => classCtorReflector.reflectInjectables(MySpecialClass)).toThrow(
        /MySpecialClass/
      );
    });
  });

  describe('Plain TypeScript Types (No Decorators)', () => {
    it('should use TypeScript type as identifier when no decorator is present', () => {
      class Dependency {}
      class TestClass {
        constructor(dep: Dependency) {}
      }

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [undefined as any],
          properties: new Map(),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        [Dependency]
      );

      const classCtorReflector = ClassCtorReflector(IdentifierBuilder(), metadataReader);
      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        metadata: undefined,
        identifier: Dependency,
        type: 'PARAM',
        value: Dependency,
      });
    });

    it('should handle multiple plain TypeScript types', () => {
      class Dep1 {}
      class Dep2 {}
      class Dep3 {}
      class TestClass {
        constructor(dep1: Dep1, dep2: Dep2, dep3: Dep3) {}
      }

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [undefined as any, undefined as any, undefined as any],
          properties: new Map(),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        [Dep1, Dep2, Dep3]
      );

      const classCtorReflector = ClassCtorReflector(IdentifierBuilder(), metadataReader);
      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(3);
      expect(result[0].identifier).toBe(Dep1);
      expect(result[1].identifier).toBe(Dep2);
      expect(result[2].identifier).toBe(Dep3);
    });

    it('should handle mixed decorated and plain types', () => {
      class Dep1 {}
      class Dep2 {}
      class TestClass {
        constructor(dep1: Dep1, dep2: Dep2) {}
      }

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [
            { kind: 1, value: 'CUSTOM_TOKEN', optional: false, tags: new Map() } as any,
            undefined as any,
          ],
          properties: new Map(),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        [Dep1, Dep2]
      );

      const classCtorReflector = ClassCtorReflector(IdentifierBuilder(), metadataReader);
      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(2);
      expect(result[0].identifier).toBe('CUSTOM_TOKEN');
      expect(result[1].identifier).toBe(Dep2);
      expect('metadata' in result[1] ? result[1].metadata : undefined).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty constructor arguments', () => {
      class TestClass {}

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [],
          properties: new Map(),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        []
      );

      const classCtorReflector = ClassCtorReflector(IdentifierBuilder(), metadataReader);
      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle when design:paramtypes is not available', () => {
      class TestClass {
        constructor(dep: any) {}
      }

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [
            { kind: 1, value: 'TOKEN', optional: false, tags: new Map() } as any,
          ],
          properties: new Map(),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        undefined
      );

      const classCtorReflector = ClassCtorReflector(IdentifierBuilder(), metadataReader);
      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(1);
      expect(result[0].identifier).toBe('TOKEN');
    });

    it('should handle when design:paramtypes returns empty array', () => {
      class TestClass {
        constructor() {}
      }

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [],
          properties: new Map(),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        []
      );

      const classCtorReflector = ClassCtorReflector(IdentifierBuilder(), metadataReader);
      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(0);
    });

    it('should use UndefinedDependency when paramType is missing but decorator exists', () => {
      class TestClass {
        constructor(dep: any) {}
      }

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [
            { kind: 1, value: 'TOKEN', optional: false, tags: new Map() } as any,
          ],
          properties: new Map(),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        [undefined]
      );

      const classCtorReflector = ClassCtorReflector(IdentifierBuilder(), metadataReader);
      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBeDefined();
    });
  });

  describe('Normal Flow with Decorators', () => {
    it('should correctly reflect constructor arguments with inject decorators', () => {
      class Dependency {}
      class TestClass {
        constructor(dep: Dependency) {}
      }

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [
            {
              kind: 1,
              value: 'SERVICE_ID',
              optional: false,
              name: undefined,
              tags: new Map(),
            } as any,
          ],
          properties: new Map(),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        [Dependency]
      );

      const classCtorReflector = ClassCtorReflector(IdentifierBuilder(), metadataReader);
      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        metadata: undefined,
        identifier: 'SERVICE_ID',
        type: 'PARAM',
        value: Dependency,
      });
    });

    it('should handle multiple constructor arguments with various decorators', () => {
      class Dep1 {}
      class Dep2 {}
      class Dep3 {}
      class TestClass {
        constructor(dep1: Dep1, dep2: Dep2, dep3: Dep3) {}
      }

      const metadataReader = createMetadataReaderStub(
        {
          constructorArguments: [
            {
              kind: 1,
              value: 'TOKEN1',
              optional: false,
              name: 'named1',
              tags: new Map(),
            } as any,
            {
              kind: 0,
              value: 'TOKEN2',
              optional: false,
              name: undefined,
              tags: new Map([['tag', 'value']]),
              chained: false,
            } as any,
            {
              kind: 2, // unmanaged
            } as any,
          ],
          properties: new Map(),
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          scope: undefined,
        },
        [Dep1, Dep2, Dep3]
      );

      const classCtorReflector = ClassCtorReflector(IdentifierBuilder(), metadataReader);
      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(3);
      expect('metadata' in result[0] ? result[0].metadata : undefined).toEqual({ name: 'named1' });
      expect('metadata' in result[1] ? result[1].metadata : undefined).toEqual({ tag: 'value' });
      expect('metadata' in result[2] ? result[2].metadata : undefined).toBeUndefined();
    });
  });
});
