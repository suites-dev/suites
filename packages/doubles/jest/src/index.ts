/// <reference types="jest" />
import { mock } from './mock.static';
export { Mocked, Stub } from './types';
/**
 * Adapter for a Jest mocking library to be used with Suites framework.
 *
 * @see https://suites.dev/docs/api-reference
 * @since 3.0.0
 * @example
 * import { adapter } from '@suites/doubles.jest';
 *
 * const mockedService = adapter.mock<MyService>(MyService);
 */
export const adapter = { mock, stub: (): jest.Mock => jest.fn() };

export { mock } from './mock.static';

/**
 * Represents a stub function
 *
 * @since 3.0.0
 * functions replaced by stubs.
 * @alias jest.fn
 * @see https://jestjs.io/docs/mock-function-api#jestfnimplementation
 * @see https://suites.dev/docs/api-reference
 */
export const stub = jest.fn();
