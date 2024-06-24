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
 * import { adapter as mock } from '@suites/doubles.sinon';
 *
 * const mockedService = mock<MyService>(MyService);
 */
export const adapter = { mock, stub: (): SinonStub => sinonStub() };

export { mock } from './mock.static';

export const stub = sinonStub();
