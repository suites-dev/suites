import { DeepPartial, Type } from '@automock/types';

import Mock = jest.Mock;
import JestMocked = jest.Mocked;

type MockOptions = { mockName?: string };
type MockObjectProp = string | symbol | number;
type MocksMap<TType> = Map<MockObjectProp, Mock<TType>>;

export const MockFactory = (() => {
  function createMockProxyRecursively<TType>(
    mockName: string
  ): Mock<Record<string | symbol | number, TType>, []> {
    const mocksMap: MocksMap<TType> = new Map();

    const proxy = new Proxy<Record<MockObjectProp, TType>>(
      {},
      {
        get: (target: Record<MockObjectProp, TType>, property: string | symbol) => {
          const propertyName = property.toString();

          if (mocksMap.has(property)) {
            return mocksMap.get(property);
          }

          const checkProp = target[property];

          let mockedProperty;

          if (property in target) {
            if (typeof checkProp === 'function') {
              mockedProperty = jest.fn();
            } else {
              mockedProperty = checkProp;
            }
          } else if (propertyName !== 'then') {
            mockedProperty = createMockProxyRecursively(propertyName);
          }

          mocksMap.set(property, mockedProperty as Mock<TType>);

          return mockedProperty;
        },
      }
    );

    return jest.fn(() => proxy);
  }

  function proxyHandler<TType>(
    mocksMap: MocksMap<TType>,
    options: MockOptions
  ): (mockPartialImpl: DeepPartial<Type> | Type<TType>, property: string | symbol) => TType {
    return (mockPartialImpl: DeepPartial<Type> | Type<TType>, property: string | symbol) => {
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

      const propertyExistInObject = property in mockPartialImpl;
      const subjectProperty = (mockPartialImpl as Record<MockObjectProp, any>)[property];
      const subjectPropertyIsFunction = typeof subjectProperty === 'function';

      let mockedFunctions;

      if (propertyExistInObject) {
        if (subjectPropertyIsFunction) {
          mockedFunctions = jest.fn<TType, any[]>(subjectProperty);
        } else {
          mockedFunctions = subjectProperty;
        }
      } else {
        mockedFunctions = createMockProxyRecursively(`${mockName}.${property.toString()}`);
      }

      mocksMap.set(property, mockedFunctions);
      return mockedFunctions;
    };
  }

  function create<TType>(mockPartialImpl?: DeepPartial<TType>): JestMocked<TType>;
  function create<TType>(type: Type<TType>): JestMocked<TType>;
  function create<TType>(
    mockPartialImpl: DeepPartial<TType> = {},
    options: MockOptions = {}
  ): JestMocked<TType> {
    const mocksMap: MocksMap<TType> = new Map();
    const { mockName = 'mock' } = options;

    return new Proxy<DeepPartial<TType> | Type<TType>>(mockPartialImpl, {
      get: proxyHandler(mocksMap, { mockName }),
    }) as JestMocked<TType>;
  }

  return { create };
})();
