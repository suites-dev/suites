/// <reference types="jest" />
import { mock } from './mock.static';
export { Mocked, Stub } from './types';
/**
 * Adapter for a Jest mocking library to be used with Suites framework.
 *
 * @see https://suites.dev/docs
 * @since 3.0.0
 * @example
 * import { adapter } from '@suites/doubles.jest';
 *
 * const mockedService = adapter.mock<MyService>(MyService);
 */
export const adapter = { mock, stub: (): jest.Mock => jest.fn() };

export { mock } from './mock.static';

/**
 * Creates a stub function for mocking method implementations in tests.
 *
 * This is an alias for Jest's `jest.fn()`, providing a consistent API across
 * different testing frameworks in the Suites ecosystem.
 *
 * @since 3.0.0
 * @alias jest.fn
 * @see https://jestjs.io/docs/mock-function-api#jestfnimplementation
 * @see https://suites.dev/docs
 *
 * @example
 * import { stub } from '@suites/doubles.jest';
 *
 * const mockFn = stub();
 * mockFn.mockReturnValue('mocked value');
 */
export const stub = jest.fn();
