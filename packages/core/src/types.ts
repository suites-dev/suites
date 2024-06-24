import type { DeepPartial } from '@suites/types.common';
import type { ArgsType, Stub } from '@suites/types.doubles';
import type { UnitReference } from './services/unit-reference';
import type { TestBedBuilder } from './services/builders/testbed-builder';

export interface UnitTestBed<TClass> {
  unit: TClass;
  unitRef: UnitReference;
}

export interface MockOverride<TDependency, TClass> {
  impl(
    mockImplementation: (stubFn: Stub<any, ArgsType<TDependency>>) => DeepPartial<TDependency>
  ): TestBedBuilder<TClass>;
  final(finalImplementation: DeepPartial<TDependency>): TestBedBuilder<TClass>;
}
