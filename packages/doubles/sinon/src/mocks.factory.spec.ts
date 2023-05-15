import { Type } from '@automock/types';
import { MockFactory } from './mock.factory';

export interface HttpArgumentsHost {
  getRequest<T = any>(): T;
  getResponse<T = any>(): T;
  getNext<T = any>(): T;
}

export interface ExecutionContext {
  getClass<T = any>(): Type<T>;
  getHandler(): (args: any[]) => any;
  switchToRpc(): any;
  switchToHttp(): HttpArgumentsHost;
  switchToWs(): any;
}

interface TestInterface {
  someNum: number;
  someBool: boolean;
  optional: string | undefined;
  func: (num: number, str: string) => boolean;
}

class TestClass {
  someMethod() {
    return 42;
  }
}

describe('Sinon Mock Factory', () => {
  const request = {
    headers: {
      authorization: 'auth',
    },
  };

  describe('client provided', () => {
    it('should convert client provided test object to mocks', () => {
      const request = { headers: { authorization: 'auth' } };

      const mock = MockFactory.create<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      });

      const result = mock.switchToHttp().getRequest();

      expect(result).toBe(request);
    });

    it('should work with truthy values properties', () => {
      const mock = MockFactory.create<TestInterface>({
        someNum: 1,
        someBool: true,
      });

      expect(mock.someNum).toBe(1);
      expect(mock.someBool).toBe(true);
    });

    it('should work with falsy values properties', () => {
      const mock = MockFactory.create<TestInterface>({
        someNum: 0,
        someBool: false,
      });

      expect(mock.someNum).toBe(0);
      expect(mock.someBool).toBe(false);
    });

    it('should work with optional values explicitly returning undefined', () => {
      const mock = MockFactory.create<TestInterface>({
        optional: undefined,
      });

      expect(mock.optional).toBe(undefined);
    });

    it('should work with properties and functions', () => {
      const mock = MockFactory.create<TestInterface>({
        someNum: 42,
        func: () => false,
      });

      const num = mock.someNum;
      expect(num).toBe(42);

      const funcResult = mock.func(42, '42');
      expect(funcResult).toBe(false);
    });

    it('should work with classes', () => {
      const mock = MockFactory.create<TestClass>();

      mock.someMethod.returns(42);

      const result = mock.someMethod();
      expect(result).toBe(42);
    });

    it('should work with promises', async () => {
      type TypeWithPromiseReturningFunctions = {
        doSomethingAsync: () => Promise<number>;
      };

      const mock = MockFactory.create<TypeWithPromiseReturningFunctions>({
        doSomethingAsync: async () => 42,
      });

      const result = await mock.doSomethingAsync();
      expect(result).toBe(42);
    });

    it('should work with unknown properties', () => {
      class Base {
        field?: unknown;
      }

      class Test {
        get base(): Base {
          return undefined as any;
        }
      }

      const base = MockFactory.create<Base>();
      const test = MockFactory.create<Test>({
        base,
      });

      expect(test.base).toBe(base);
    });
  });

  describe('auto mocked', () => {
    it('should auto mock functions that are not provided by client', () => {
      const mock = MockFactory.create<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      });

      expect(mock.switchToRpc).toBeDefined();
      expect(mock.switchToRpc).toBeDefined();
      expect(mock.switchToWs).toBeDefined();
    });

    it('and also for literal values', () => {
      const mock = MockFactory.create<TestClass>(TestClass);

      mock.someMethod.returns(45);
      expect(mock.someMethod()).toBe(45);
    });

    it('should allow for mock implementation on auto mocked properties', () => {
      const executionContextMock = MockFactory.create<ExecutionContext>();
      const httpArgsHost = MockFactory.create<HttpArgumentsHost>({});

      executionContextMock.switchToHttp.returns({ getRequest: () => request } as HttpArgumentsHost);

      const result = executionContextMock.switchToHttp().getRequest();
      expect(result).toBe(request);
      expect(httpArgsHost.getRequest).toBeDefined();
    });

    it('should automock promises so that they are awaitable', async () => {
      type TypeWithPromiseReturningFunctions = {
        doSomethingAsync: () => Promise<number>;
      };

      const mock = MockFactory.create<TypeWithPromiseReturningFunctions>();

      const result = await mock.doSomethingAsync();
      expect(result).toBeDefined();
    });
  });
});
