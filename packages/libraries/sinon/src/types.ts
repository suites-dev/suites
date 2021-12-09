import { MockFn, SinonMockFn } from '@automock/common';

export type MockOf<T> = MockFn<T, SinonMockFn<T>>;
