import { JestMockFn } from '@aromajs/common';

export * from './jest-unit-builder';
export * from './spec-factory';

export type MockOf<T> = JestMockFn<T>;
