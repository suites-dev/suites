import { SinonStubbedInstance, stub } from 'sinon';

type PropertyType = string | number | symbol;

const createHandler = () => ({
  get: (target: SinonStubbedInstance<any>, property: PropertyType) => {
    if (!(property in target)) {
      if (property === 'then') {
        return undefined;
      }

      if (property === Symbol.iterator) {
        return target[property as never];
      }

      target[property as string] = stub();
    }

    if (target instanceof Date && typeof target[property as never] === 'function') {
      return (target[property as never] as SinonStubbedInstance<any>).bind(target);
    }

    return target[property as string];
  },
});

const applyMockImplementation = (initialObject: Record<string, any>) => {
  const proxy = new Proxy<SinonStubbedInstance<any>>(initialObject, createHandler());

  for (const key of Object.keys(initialObject)) {
    if (typeof initialObject[key] === 'object' && initialObject[key] !== null) {
      proxy[key] = applyMockImplementation(initialObject[key]);
    } else {
      proxy[key] = initialObject[key];
    }
  }

  return proxy;
};

export const mock = <T>(mockImpl: Partial<T> = {} as Partial<T>): SinonStubbedInstance<T> => {
  return applyMockImplementation(mockImpl);
};
