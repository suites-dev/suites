/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { DeepPartial } from '@suites/types.common';
import type { Mock } from '@vitest/spy';
import type { Mocked } from './types';

type ProxiedProperty = string | number | symbol;

const overrideMockImp = <T>(obj: DeepPartial<T>): Mocked<T> => {
  const proxy = new Proxy<Mocked<T>>(obj as Mocked<T>, handler());

  for (const name of Object.keys(obj)) {
    if (typeof obj[name as never] === 'object' && obj[name as never] !== null) {
      // @ts-ignore
      proxy[name] = overrideMockImp(obj[name as never]);
    } else {
      // @ts-ignore
      proxy[name] = obj[name];
    }
  }

  return proxy;
};

const handler = <T>() => ({
  set: (obj: Mocked<T>, property: ProxiedProperty, value: T) => {
    // @ts-ignore https://github.com/microsoft/TypeScript/issues/1863
    obj[property] = value;
    return true;
  },

  get: (obj: Mocked<T>, property: ProxiedProperty) => {
    // @ts-ignore
    if (!(property in obj)) {
      if (property === 'then') {
        return undefined;
      }

      // Vitest's internal equality checking does some wierd stuff to check for iterable equality
      if (property === Symbol.iterator) {
        // @ts-ignore
        return obj[property];
      }

      if (property !== 'calls') {
        // @ts-ignore
        // eslint-disable-next-line no-undef
        obj[property] = new Proxy<Mock<T>>(vi.fn(), handler());
        // @ts-ignore private property
        obj[property as never]._isMockObject = true;
      }
    }

    // @ts-ignore
    if (obj instanceof Date && typeof obj[property] === 'function') {
      // @ts-ignore
      return obj[property].bind(obj);
    }

    // @ts-ignore
    return obj[property];
  },
});

/**
 * Creates a fully mocked instance with auto-generated Vitest stub methods.
 *
 * This function creates a type-safe mock where all methods are automatically replaced
 * with `vi.fn()` instances. Properties are lazily created on first access using
 * JavaScript Proxy, providing intelligent auto-mocking without manual setup.
 *
 * @template T The type of the object to mock
 * @param mockImplementation - Optional partial implementation to pre-configure specific methods or properties
 * @returns A fully mocked instance where all methods are `vi.fn()` stubs with full Vitest API support
 *
 * @remarks
 * - All methods automatically become Vitest mocks on first access
 * - Supports nested object mocking
 *
 * @example
 * ```ts
 * // Basic usage - mock an interface
 * import { mock } from '@suites/unit';
 *
 * interface PaymentGateway {
 *   charge(amount: number): Promise<{ status: string }>;
 *   refund(transactionId: string): Promise<boolean>;
 * }
 *
 * const gateway = mock<PaymentGateway>();
 * gateway.charge.mockResolvedValue({ status: 'success' });
 * gateway.refund.mockResolvedValue(true);
 *
 * const userService = mock<UserService>();
 * userService.findUser.mockResolvedValue({ id: '1', name: 'John' });
 * ```
 *
 * @since 3.0.0
 * @see {@link https://vitest.dev/api/vi.html#vi-fn | Vitest Mock Functions}
 * @see {@link https://suites.dev/docs/api-reference/mock | Mock API Reference}
 */
export const mock = <T>(mockImplementation: DeepPartial<T> = {} as DeepPartial<T>): Mocked<T> => {
  // @ts-ignore private property
  mockImplementation!._isMockObject = true;

  return overrideMockImp<T>(mockImplementation);
};
