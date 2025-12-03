/* eslint-disable @typescript-eslint/no-unused-vars */
import { mock } from './mock.static';
import type { Mocked } from './types';

interface ArbitraryMock {
  id: number;
  someValue?: boolean | null;
  getNumber: () => number;
  getNumberWithMockArg: (mock: never) => number;
  getSomethingWithArgs: (arg1: number, arg2: number) => number;
  getSomethingWithMoreArgs: (arg1: number, arg2: number, arg3: number) => number;
}

interface User {
  id: string;
  name: string;
  age: number;
}

class Prisma {
  public user: {
    create: (data: User) => Promise<User>;
    delete: (where: { id: string }) => Promise<User>;
  };
}

class TestClass implements ArbitraryMock {
  readonly id: number;

  constructor(id: number) {
    this.id = id;
  }

  public ofAnother(test: TestClass) {
    return test.getNumber();
  }

  public getNumber() {
    return this.id;
  }

  public getNumberWithMockArg(mock: never) {
    return this.id;
  }

  public getSomethingWithArgs(arg1: number, arg2: number) {
    return this.id;
  }

  public getSomethingWithMoreArgs(arg1: number, arg2: number, arg3: number) {
    return this.id;
  }
}

describe('Mocking Proxy Mechanism Unit Spec', () => {
  describe('basic functionality', () => {
    test('should allow assignment to itself even with private parts', () => {
      const mockObject: Mocked<TestClass> = mock<TestClass>();
      new TestClass(1).ofAnother(mockObject);
      expect(mockObject.getNumber).toHaveBeenCalledTimes(1);
    });

    test('should create vi.fn() without any invocation', () => {
      const mockObject = mock<ArbitraryMock>();
      expect(mockObject.getNumber).toHaveBeenCalledTimes(0);
    });

    test('should register invocations correctly', () => {
      const mockObject: ArbitraryMock = mock<ArbitraryMock>();
      mockObject.getNumber();
      mockObject.getNumber();
      expect(mockObject.getNumber).toHaveBeenCalledTimes(2);
    });
  });

  describe('mock return values and arguments', () => {
    test('should allow mocking a return value', () => {
      const mockObject = mock<ArbitraryMock>();
      mockObject.getNumber.mockReturnValue(12);
      expect(mockObject.getNumber()).toBe(12);
    });

    test('should allow specifying arguments', () => {
      const mockObject = mock<ArbitraryMock>();
      mockObject.getSomethingWithArgs(1, 2);
      expect(mockObject.getSomethingWithArgs).toBeCalledWith(1, 2);
    });
  });

  describe('mock properties', () => {
    test('should allow setting properties', () => {
      const mockObject = mock<ArbitraryMock>();
      mockObject.id = 17;
      expect(mockObject.id).toBe(17);
    });

    test('should allow setting boolean properties to false or null', () => {
      const mockObject = mock<ArbitraryMock>({ someValue: false });
      const mockObj2 = mock<ArbitraryMock>({ someValue: null });
      expect(mockObject.someValue).toBe(false);
      expect(mockObj2.someValue).toBe(null);
    });

    test('should allow setting properties to undefined explicitly', () => {
      const mockObject = mock<ArbitraryMock>({ someValue: undefined });
      expect(mockObject.someValue).toBe(undefined);
    });
  });

  describe('mock implementation', () => {
    test('should allow providing mock implementations for properties', () => {
      const mockObject = mock<TestClass>({ id: 61 });
      expect(mockObject.id).toBe(61);
    });

    test('should allow providing mock implementations for functions', () => {
      const mockObject = mock<TestClass>({ getNumber: () => 150 });
      expect(mockObject.getNumber()).toBe(150);
    });
  });

  describe('promises', () => {
    test('should successfully use mock for promises resolving', async () => {
      const mockObject = mock<ArbitraryMock>();
      mockObject.id = 17;

      const promiseMockObj = Promise.resolve(mockObject);

      await expect(promiseMockObj).resolves.toBeDefined();
      await expect(promiseMockObj).resolves.toMatchObject({ id: 17 });
    });

    test('should successfully use mock for promises rejecting', async () => {
      const mockError = mock<Error>();
      mockError.message = '17';
      const promiseMockObj = Promise.reject(mockError);

      await expect(promiseMockObj).rejects.toBeDefined();
      await expect(promiseMockObj).rejects.toBe(mockError);
      await expect(promiseMockObj).rejects.toHaveProperty('message', '17');
    });
  });

  describe('mocking a date objects', () => {
    test('should allow calling native date object methods', () => {
      const mockObject = mock({ date: new Date('2000-01-15') });
      expect(mockObject.date.getFullYear()).toBe(2000);
      expect(mockObject.date.getMonth()).toBe(0);
      expect(mockObject.date.getDate()).toBe(15);
    });
  });

  describe('mocking nested objects', () => {
    test('should allow mocking nested objects', () => {
      const mockObject = mock<Prisma>();

      mockObject.user.create({ id: '123', name: 'Mashu', age: 123 });

      expect(mockObject.user.create).toHaveBeenCalledTimes(1);
      expect(mockObject.user.create).toHaveBeenCalledWith({ id: '123', name: 'Mashu', age: 123 });
    });

    test('should allow mocking nested objects with promises', async () => {
      const mockObject = mock<Prisma>();

      mockObject.user.create.mockResolvedValue({ id: '123', name: 'Mashu', age: 123 });

      await expect(
        mockObject.user.create({ id: '123', name: 'Mashu', age: 123 })
      ).resolves.toMatchObject({ id: '123', name: 'Mashu', age: 123 });
    });

    test('should allow mocking nested objects with promises and rejections', async () => {
      const mockObject = mock<Prisma>();

      mockObject.user.create.mockRejectedValue(new Error('Some error'));

      await expect(
        mockObject.user.create({ id: '123', name: 'Mashu', age: 123 })
      ).rejects.toThrowError('Some error');
    });
  });
});
