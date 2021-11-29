import { SinonMockFn } from '@aromajs/common';

export * from './sinon-unit-builder';
export * from './spec-factory';

export type MockOf<T> = SinonMockFn<T>;
