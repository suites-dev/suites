import { ConcreteMock, JestMockFn } from '@automock/common';

export * from './jest-unit-builder';
export * from './spec-factory';

export type MockOf<T> = ConcreteMock<T, JestMockFn<T>>;
