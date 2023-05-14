/// <reference types="@types/sinon" />
import { SinonStubbedInstance } from 'sinon';
import { Type } from '@automock/types';

export * from './testbed-factory';

declare module '@automock/core' {
  interface UnitReference {
    get<TDep>(type: Type<TDep>): SinonStubbedInstance<TDep>;
  }
}
