/// <reference types="vitest" />
import { mock } from './mock.static.js';
export { Mocked, Stub } from './types.js';
import type { Mock } from '@vitest/spy';
import { fn } from '@vitest/spy';

/**
 * Adapter for a Vitest mocking library to be used with Suites framework.
 *
 * @see https://suites.dev/docs
 * @since 3.0.0
 * @example
 * import { adapter } from '@suites/doubles.vitest';
 *
 * const mockedService = adapter.mock<MyService>(MyService);
 */
export const adapter = { mock, stub: (): Mock => fn() };

export { mock } from './mock.static.js';

/**
 * Creates a stub function for mocking method implementations in tests.
 *
 * This is an alias for Vitest's `fn()`, providing a consistent API across
 * different testing frameworks in the Suites ecosystem.
 *
 * @since 3.0.0
 * @alias fn
 * @see https://vitest.dev/api/vi.html#vi-fn
 * @see https://suites.dev/docs
 *
 * @example
 * import { stub } from '@suites/doubles.vitest';
 *
 * const mockFn = stub();
 * mockFn.mockReturnValue('mocked value');
 */
export const stub = fn();
