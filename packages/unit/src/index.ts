import { JestMockFn, SinonMockFn } from '@automock/common';
import { TestingUnit } from '@automock/core';

export * from './lib/unit-factory';

export type MockOf<T> = JestMockFn<T> | SinonMockFn<T>;
export type TestingUnitt<T> = TestingUnit<T>;
