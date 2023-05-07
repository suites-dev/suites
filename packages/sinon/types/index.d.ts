/// <reference types="@types/sinon" />

import { Type } from '@automock/types';
import { SinonStubbedInstance } from 'sinon';

declare module '@automock/core' {
  interface UnitReference {
    get<TDep>(type: Type<TDep>): SinonStubbedInstance<TDep>;
  }
}
