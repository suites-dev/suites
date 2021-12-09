import { MockFn, JestMockFn } from '@automock/common';

export type MockOf<T> = MockFn<T, JestMockFn<T>>;
