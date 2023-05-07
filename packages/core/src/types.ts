import { Stubbable, StubbedInstance } from '@automock/types';
import { UnitReference } from './services/unit-reference';

export interface UnitTestbed<TClass> {
  unit: TClass;
  unitRef: UnitReference;
}

export type MockFunction<TType> = (implementation?: Stubbable<TType>) => StubbedInstance<TType>;
