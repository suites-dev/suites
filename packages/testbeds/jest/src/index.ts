/// <reference types="jest" />

import { Type } from '@automock/types';

export * from './testbed-factory';

declare module '@automock/core' {
  interface UnitReference {
    get<TDep>(type: Type<TDep>): jest.Mocked<TDep>;
  }
}
