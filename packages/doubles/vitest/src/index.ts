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
 * Represents a stub function
 *
 * @since 3.0.0
 * functions replaced by stubs.
 * @alias fn
 * @see https://vitest.dev/api/vi.html#vi-fn
 * @see https://suites.dev/docs/api-reference
 */
export const stub = fn();
