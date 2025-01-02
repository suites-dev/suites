import type { DeepPartial } from '@suites/types.common';

import Mocked = jest.Mocked;

type PropertyType = string | number | symbol;

const createHandler = () => ({
  get: (target: Mocked<unknown>, property: PropertyType) => {
    if (!(property in target)) {
      if (property === 'then') {
        return undefined;
      }

      if (property === Symbol.iterator) {
        return target[property as never];
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      target[property] = jest.fn();
    }

    if (target instanceof Date && typeof target[property as never] === 'function') {
      return (target[property as never] as Mocked<any>).bind(target);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return target[property];
  },
});

const applyMockImplementation = (initialObject: DeepPartial<never>) => {
  const proxy = new Proxy<Mocked<never>>(initialObject, createHandler());

  for (const key of Object.keys(initialObject)) {
    if (typeof initialObject[key] === 'object' && initialObject[key] !== null) {
      proxy[key] = applyMockImplementation(initialObject[key]);
    } else {
      proxy[key] = initialObject[key];
    }
  }

  return proxy;
};

export const mock = <T, MockedType extends Mocked<T> & T = Mocked<T> & T>(
  mockImpl: Partial<T> = {} as Partial<T>
): MockedType => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockImpl._isMockObject = true;
  return applyMockImplementation(mockImpl as never);
};
