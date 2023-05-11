import { DeepPartial, Type } from '@automock/types';
import sinon, { createStubInstance, SinonStubbedInstance, SinonStubStatic } from 'sinon';

type SinonMocked<T> = SinonStubbedInstance<T>;

type MockObjectProp = string | symbol | number;
type MocksMap = Map<MockObjectProp, SinonStubStatic>;

export const MockFactory = (() => {
  function createMockProxyRecursively<TType>(): SinonStubStatic {
    const mocksMap: MocksMap = new Map();

    const proxy = new Proxy<Record<MockObjectProp, TType>>(
      {},
      {
        get: (target: Record<MockObjectProp, TType>, property: string | symbol) => {
          if (mocksMap.has(property)) {
            return mocksMap.get(property);
          }

          const checkProp = target[property];

          let mockedProperty;

          if (property in target) {
            if (typeof checkProp === 'function') {
              mockedProperty = createStubInstance(checkProp);
            } else {
              mockedProperty = checkProp;
            }
          }

          mocksMap.set(property, mockedProperty as SinonStubStatic);

          return mockedProperty;
        },
      }
    );

    return sinon.stub().callsFake(() => proxy);
  }

  function proxyHandler<TType>(
    mocksMap: MocksMap
  ): (mockPartialImpl: DeepPartial<Type> | Type<TType>, property: string | symbol) => TType {
    return (mockPartialImpl: DeepPartial<Type> | Type<TType>, property: string | symbol) => {
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
          mockedFunctions = sinon.stub(subjectProperty);
        } else {
          mockedFunctions = subjectProperty;
        }
      } else {
        mockedFunctions = createMockProxyRecursively();
      }

      mocksMap.set(property, mockedFunctions);
      return mockedFunctions;
    };
  }

  function create<TType>(obj: DeepPartial<TType> | Type<TType> = {}): SinonMocked<TType> {
    const mocksMap: MocksMap = new Map();

    return new Proxy<DeepPartial<TType> | Type<TType>>(obj, {
      get: proxyHandler(mocksMap),
    }) as SinonMocked<TType>;
  }

  return { create };
})();
