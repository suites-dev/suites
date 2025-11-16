/// <reference types="vitest" />
import { mock } from './mock.static';
export { Mocked, Stub } from './types';
import type { Mock } from '@vitest/spy';
import { fn } from '@vitest/spy';

/**
 * Adapter for a Vitest mocking library to be used with Suites framework.
 *
 * @see https://suites.dev/docs/api-reference
 * @since 3.0.0
 * @example
 * import { adapter } from '@suites/doubles.vitest';
 *
 * const mockedService = adapter.mock<MyService>(MyService);
 */
export const adapter = { mock, stub: (): Mock => fn() };

export { mock } from './mock.static';

/**
 * Creates a standalone Vitest mock function for stubbing callbacks and functions.
 *
 * This function creates a `vi.fn()` instance that can be configured with return values,
 * implementations, and used to assert call patterns. It's ideal for stubbing callbacks,
 * event handlers, or any standalone function that needs to be mocked.
 *
 * @returns A Vitest mock function with full Vitest mocking API support
 *
 * @remarks
 * - Returns a `vi.fn()` when `@suites/doubles.vitest` is installed
 * - Automatically tracks all calls, arguments, and return values
 * - Supports all Vitest mock methods (mockReturnValue, mockResolvedValue, etc.)
 * - Use for standalone functions, callbacks, and event handlers
 * - For mocking entire objects, use `mock<T>()` instead
 *
 * @example
 * // Basic usage - create a simple stub
 * import { stub } from '@suites/unit';
 *
 * const callback = stub();
 * callback.mockReturnValue(42);
 *
 * const result = callback(); // returns 42
 * expect(callback).toHaveBeenCalledTimes(1);
 *
 * @since 3.0.0
 * @see {@link https://vitest.dev/api/vi.html#vi-fn Vitest Mock Functions}
 * @see {@link https://suites.dev/docs/api-reference/stub Stub API Reference}
 * @see {@link mock} for mocking entire objects
 */
export const stub = fn();
