import { ConcreteMock, JestMockFn } from '@automock/common';

export type MockOf<T> = ConcreteMock<T, JestMockFn<T>>;
