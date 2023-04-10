import { FnPartialReturn } from '@automock/types';
import { DeepMocked } from './types';

import Mock = jest.Mock;

type MockOptions = { mockName?: string };
type MockObjectRecordKey = string | symbol | number;
type MockOrDeepMock<TType> = DeepMocked<TType> | Mock<TType>;
type MockObjectRecord<TType> = Map<MockObjectRecordKey, MockOrDeepMock<TType>>;

export type MockFactory = {
  create<TType extends Record<MockObjectRecordKey, any>>(): DeepMocked<TType>;
};

export const MockFactory = (() => {
  function createMockProxyRecursively<TType>(
    mockName: string
  ): Mock<DeepMocked<Record<MockObjectRecordKey, TType>>> {
    const mocksMap: MockObjectRecord<TType> = new Map();

    const proxy = new Proxy<DeepMocked<Record<MockObjectRecordKey, TType>>>(
      {},
      {
        get: (
          target: DeepMocked<Record<MockObjectRecordKey, TType>>,
          property: string | symbol
        ) => {
          const propertyName = property.toString();

          if (mocksMap.has(property)) {
            return mocksMap.get(property);
          }

          const checkProp = target[property];

          const mockedProperty =
            property in target
              ? typeof checkProp === 'function'
                ? jest.fn()
                : checkProp
              : propertyName === 'then'
              ? undefined
              : createMockProxyRecursively(propertyName);

          mocksMap.set(property, mockedProperty as MockOrDeepMock<TType>);

          return mockedProperty;
        },
      }
    );

    return jest.fn(() => proxy);
  }

  function proxyHandler<TType>(
    mocksMap: MockObjectRecord<TType>,
    options: MockOptions
  ): (returnPartialObject: FnPartialReturn<TType>, property: string | symbol) => TType {
    return (returnPartialObject: FnPartialReturn<TType>, property: string | symbol) => {
      const { mockName = 'mock' } = options;

      if (
        ['constructor', 'inspect', 'then'].some((val) => val === property) ||
        (typeof property === 'symbol' && property.toString() === 'Symbol(util.inspect.custom)')
      ) {
        return undefined;
      }

      if (mocksMap.has(property)) {
        return mocksMap.get(property);
      }

      const propertyExistInObject = property in returnPartialObject;
      const subjectProperty = (returnPartialObject as Record<MockObjectRecordKey, any>)[property];
      const subjectPropertyIsFunction = typeof subjectProperty === 'function';

      const mockedFunctions = propertyExistInObject
        ? subjectPropertyIsFunction
          ? jest.fn<TType, any[]>(subjectProperty)
          : subjectProperty
        : createMockProxyRecursively(`${mockName}.${property.toString()}`);

      mocksMap.set(property, mockedFunctions);
      return mockedFunctions;
    };
  }

  function create<TType extends Record<MockObjectRecordKey, any>>(
    mockPartialImpl: FnPartialReturn<TType> = {},
    options: MockOptions = {}
  ): DeepMocked<TType> {
    const mocksMap: MockObjectRecord<TType> = new Map();
    const { mockName = 'mock' } = options;

    return new Proxy<FnPartialReturn<TType>>(mockPartialImpl, {
      get: proxyHandler(mocksMap, { mockName }),
    }) as DeepMocked<TType>;
  }

  return { create };
})();
