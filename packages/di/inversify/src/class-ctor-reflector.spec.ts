/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata';
import { getClassMetadata } from '@inversifyjs/core';
import { ClassCtorReflector } from './class-ctor-reflector';
import { IdentifierBuilder } from './identifier-builder.static';
import { UndefinedDependencyError } from '@suites/types.di';

jest.mock('@inversifyjs/core');

const mockGetClassMetadata = getClassMetadata as jest.MockedFunction<typeof getClassMetadata>;

describe('ClassCtorReflector Unit Tests', () => {
  let classCtorReflector: ReturnType<typeof ClassCtorReflector>;

  beforeEach(() => {
    classCtorReflector = ClassCtorReflector(IdentifierBuilder());
    jest.clearAllMocks();
  });

  describe('Error Handling', () => {
    it('should throw UndefinedDependencyError when parameter has no metadata and no TypeScript type', () => {
      class TestClass {
        constructor(_dependency: any) {}
      }

      mockGetClassMetadata.mockReturnValue({
        constructorArguments: [undefined as any],
        properties: new Map(),
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        scope: undefined,
      });

      // Mock design:paramtypes to return undefined for first parameter
      jest.spyOn(Reflect, 'getMetadata').mockReturnValue([undefined]);

      expect(() => classCtorReflector.reflectInjectables(TestClass)).toThrow(
        UndefinedDependencyError
      );
      expect(() => classCtorReflector.reflectInjectables(TestClass)).toThrow(
        /Suites encountered an error while attempting to detect a token or type/
      );
    });

    it('should include parameter index in error message', () => {
      class TestClass {
        constructor(_dep1: string, _dep2: any, _dep3: string) {}
      }

      mockGetClassMetadata.mockReturnValue({
        constructorArguments: [
          { kind: 1, value: 'dep1', optional: false, tags: new Map() } as any,
          undefined as any,
          { kind: 1, value: 'dep3', optional: false, tags: new Map() } as any,
        ],
        properties: new Map(),
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        scope: undefined,
      });

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue([String, undefined, String]);

      expect(() => classCtorReflector.reflectInjectables(TestClass)).toThrow(/index \[1\]/);
    });

    it('should include class name in error message', () => {
      class MySpecialClass {
        constructor(_dependency: any) {}
      }

      mockGetClassMetadata.mockReturnValue({
        constructorArguments: [undefined as any],
        properties: new Map(),
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        scope: undefined,
      });

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue([undefined]);

      expect(() => classCtorReflector.reflectInjectables(MySpecialClass)).toThrow(
        /MySpecialClass/
      );
    });
  });

  describe('Plain TypeScript Types (No Decorators)', () => {
    it('should use TypeScript type as identifier when no decorator is present', () => {
      class Dependency {}
      class TestClass {
        constructor(_dep: Dependency) {}
      }

      mockGetClassMetadata.mockReturnValue({
        constructorArguments: [undefined as any],
        properties: new Map(),
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        scope: undefined,
      });

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue([Dependency]);

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
        constructor(_dep1: Dep1, _dep2: Dep2, _dep3: Dep3) {}
      }

      mockGetClassMetadata.mockReturnValue({
        constructorArguments: [undefined as any, undefined as any, undefined as any],
        properties: new Map(),
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        scope: undefined,
      });

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue([Dep1, Dep2, Dep3]);

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
        constructor(_dep1: Dep1, _dep2: Dep2) {}
      }

      mockGetClassMetadata.mockReturnValue({
        constructorArguments: [
          { kind: 1, value: 'CUSTOM_TOKEN', optional: false, tags: new Map() } as any,
          undefined as any, // No decorator
        ],
        properties: new Map(),
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        scope: undefined,
      });

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue([Dep1, Dep2]);

      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(2);
      expect(result[0].identifier).toBe('CUSTOM_TOKEN');
      expect(result[1].identifier).toBe(Dep2);
      expect(result[1].metadata).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty constructor arguments', () => {
      class TestClass {}

      mockGetClassMetadata.mockReturnValue({
        constructorArguments: [],
        properties: new Map(),
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        scope: undefined,
      });

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue([]);

      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle when design:paramtypes is not available', () => {
      class TestClass {
        constructor(_dep: any) {}
      }

      mockGetClassMetadata.mockReturnValue({
        constructorArguments: [
          { kind: 1, value: 'TOKEN', optional: false, tags: new Map() } as any,
        ],
        properties: new Map(),
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        scope: undefined,
      });

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(1);
      expect(result[0].identifier).toBe('TOKEN');
    });

    it('should handle when design:paramtypes returns empty array', () => {
      class TestClass {
        constructor() {}
      }

      mockGetClassMetadata.mockReturnValue({
        constructorArguments: [],
        properties: new Map(),
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        scope: undefined,
      });

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue([]);

      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(0);
    });

    it('should use UndefinedDependency when paramType is missing but decorator exists', () => {
      class TestClass {
        constructor(_dep: any) {}
      }

      mockGetClassMetadata.mockReturnValue({
        constructorArguments: [
          { kind: 1, value: 'TOKEN', optional: false, tags: new Map() } as any,
        ],
        properties: new Map(),
        lifecycle: {
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        scope: undefined,
      });

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue([undefined]);

      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBeDefined();
    });
  });

  describe('Normal Flow with Decorators', () => {
    it('should correctly reflect constructor arguments with inject decorators', () => {
      class Dependency {}
      class TestClass {
        constructor(_dep: Dependency) {}
      }

      mockGetClassMetadata.mockReturnValue({
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
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        scope: undefined,
      });

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue([Dependency]);

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
        constructor(_dep1: Dep1, _dep2: Dep2, _dep3: Dep3) {}
      }

      mockGetClassMetadata.mockReturnValue({
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
          postConstructMethodNames: new Set(),
          preDestroyMethodNames: new Set(),
        },
        scope: undefined,
      });

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue([Dep1, Dep2, Dep3]);

      const result = classCtorReflector.reflectInjectables(TestClass);

      expect(result).toHaveLength(3);
      expect(result[0].metadata).toEqual({ name: 'named1' });
      expect(result[1].metadata).toEqual({ tag: 'value' });
      expect(result[2].metadata).toBeUndefined();
    });
  });
});
