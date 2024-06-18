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

/**
 * Creates a mock object with the provided implementation.
 *
 * @since 3.0.0
 * @template TType - The type of the object being mocked.
 * @template MockedType - The type of the mock object.
 * @param {Partial<TType>} mockImpl - The implementation of the mock object.
 * @default {} - An empty object.
 * @returns {jest.Mocked<TType>} - The mocked object with the provided implementation.
 */
export const mock = <TType, MockedType extends Mocked<TType> & TType = Mocked<TType> & TType>(
  mockImpl: Partial<TType> = {} as Partial<TType>
): MockedType => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockImpl._isMockObject = true;
  return applyMockImplementation(mockImpl as never);
};
