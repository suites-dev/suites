/// <reference types="jest" />
import { mock } from './mock.static';
export { Mocked, Stub } from './types';
/**
 * Adapter for a Jest mocking library to be used with Suites framework.
 *
 * @see {@link https://suites.dev/docs/api-reference/mock | Mock API Reference}
 * @since 3.0.0
 * @example
 * ```ts
 * import { adapter } from '@suites/doubles.jest';
 *
 * const mockedService = adapter.mock<MyService>();
 * ```
 */
export const adapter = { mock, stub: (): jest.Mock => jest.fn() };

export { mock } from './mock.static';

/**
 * Creates a standalone Jest mock function for stubbing callbacks and functions.
 *
 * This function creates a `jest.fn()` instance that can be configured with return values,
 * implementations, and used to assert call patterns. It's ideal for stubbing callbacks,
 * event handlers, or any standalone function that needs to be mocked.
 *
 * @returns A Jest mock function with full Jest mocking API support
 *
 * @remarks
 * - Returns a `jest.fn()` when `@suites/doubles.jest` is installed
 * - Automatically tracks all calls, arguments, and return values
 * - Supports all Jest mock methods (mockReturnValue, mockResolvedValue, etc.)
 * - Use for standalone functions, callbacks, and event handlers
 * - For mocking entire objects, use `mock<T>()` instead
 *
 * @example
 * ```ts
 * // Basic usage - create a simple stub
 * import { stub } from '@suites/unit';
 *
 * const callback = stub();
 * callback.mockReturnValue(42);
 *
 * const result = callback(); // returns 42
 * expect(callback).toHaveBeenCalledTimes(1);
 * ```
 *
 * @since 3.0.0
 * @see {@link https://jestjs.io/docs/mock-function-api | Jest Mock Functions}
 * @see {@link https://suites.dev/docs/api-reference/mock | Stub API Reference}
 * @see {@link mock} for mocking entire objects
 */
export const stub = jest.fn;
