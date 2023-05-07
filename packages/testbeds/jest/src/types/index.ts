/// <reference types="jest" />

import { Type } from '@automock/types';

declare module '@automock/core' {
  interface UnitReference {
    get<TDep>(type: Type<TDep>): jest.Mocked<TDep>;
  }
}
