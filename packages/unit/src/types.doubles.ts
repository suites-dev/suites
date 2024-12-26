/// <reference types="jest" />
/// <reference types="vitest" />
/// <reference types="@types/sinon" />

import type { StubbedInstance } from '@suites/types.doubles';

// Re-export the StubbedInstance type
export type { StubbedInstance };

// Export framework-specific mocked types
export type JestMocked<T> = jest.Mocked<T>;
export type VitestMocked<T> = import('@vitest/spy').Mocked<T>;
export type SinonMocked<T> = import('sinon').SinonStubbedInstance<T>;

// Default to Jest's Mocked type as it's the most commonly used
export type Mocked<T> = JestMocked<T>;
