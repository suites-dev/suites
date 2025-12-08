/// <reference types="@types/sinon" />
import { mock } from './mock.static';
import type { SinonStub } from 'sinon';
import { stub as sinonStub } from 'sinon';
export { Mocked, Stub } from './types';

/**
 * Adapter for a Sinon mocking library to be used with Suites framework.
 *
 * @see https://suites.dev/docs/api-reference
 * @since 3.0.0
 * @example
 * ```ts
 * import { adapter as mock } from '@suites/doubles.sinon';
 *
 * const mockedService = mock<MyService>();
 * ```
 */
export const adapter = { mock, stub: (): SinonStub => sinonStub() };

export { mock } from './mock.static';

/**
 * Creates a standalone Sinon stub function for stubbing callbacks and functions.
 *
 * This function creates a `sinon.stub()` instance that can be configured with return values,
 * behaviors, and used to assert call patterns. It's ideal for stubbing callbacks,
 * event handlers, or any standalone function that needs to be mocked.
 *
 * @returns A Sinon stub with full Sinon API support
 *
 * @remarks
 * - Returns a `sinon.stub()` when `@suites/doubles.sinon` is installed
 * - Automatically tracks all calls, arguments, and return values
 * - Supports all Sinon stub methods (returns, resolves, rejects, throws, etc.)
 * - Use for standalone functions, callbacks, and event handlers
 * - For mocking entire objects, use `mock<T>()` instead
 *
 * @example
 * ```ts
 * // Basic usage - create a simple stub
 * import { stub } from '@suites/unit';
 *
 * const callback = stub();
 * callback.returns(42);
 *
 * const result = callback(); // returns 42
 * expect(callback.calledOnce).toBe(true);
 * ```
 *
 * @since 3.0.0
 * @see {@link https://sinonjs.org/releases/latest/stubs/ | Sinon Stubs}
 * @see {@link https://suites.dev/docs/api-reference/mock | Stub API Reference}
 * @see {@link mock} for mocking entire objects
 */
export const stub = sinonStub;
