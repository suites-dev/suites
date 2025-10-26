/// <reference types="@types/sinon" />
import { mock } from './mock.static.js';
import type { SinonStub } from 'sinon';
import { stub as sinonStub } from 'sinon';
export { Mocked, Stub } from './types.js';

/**
 * Adapter for a Sinon mocking library to be used with Suites framework.
 *
 * @see https://suites.dev/docs
 * @since 3.0.0
 * @example
 * import { adapter as mock } from '@suites/doubles.sinon';
 *
 * const mockedService = mock<MyService>(MyService);
 */
export const adapter = { mock, stub: (): SinonStub => sinonStub() };

export { mock } from './mock.static.js';

/**
 * Creates a stub function for mocking method implementations in tests.
 *
 * This is an alias for Sinon's `stub()`, providing a consistent API across
 * different testing frameworks in the Suites ecosystem.
 *
 * @since 3.0.0
 * @alias sinon.stub
 * @see https://sinonjs.org/releases/latest/stubs/
 * @see https://suites.dev/docs
 *
 * @example
 * import { stub } from '@suites/doubles.sinon';
 *
 * const mockFn = stub();
 * mockFn.returns('mocked value');
 */
export const stub = sinonStub();
