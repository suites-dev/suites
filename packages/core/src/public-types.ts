import { UnitReference } from './services/unit-reference';
import { ConstantValue } from '@automock/common';
import { DeepPartial, Type } from '@automock/types';

/**
 * Represents the result of compiling a unit test bed.
 * @template TClass - The type of the class under test.
 */
export interface UnitTestBed<TClass> {
  /**
   * The instance of the class under test.
   *
   * @template TClass - The type of class instance.
   * @property unit {TClass}
   */
  unit: TClass;

  /**
   * The reference to the dependencies of the class under test.
   *
   * @property unitRef {UnitReference}
   */
  unitRef: UnitReference;
}

/**
 * Represents an override configuration for a mocked dependency.
 */
export interface MockOverride<TDependency, TClass> {
  /**
   * Specifies the value to be used for the mocked dependency.
   *
   * @param value - The value for the mocked dependency.
   * @returns A `TestBedBuilder` instance for chaining further configuration.
   */
  using(value: ConstantValue): TestBedBuilder<TClass>;

  /**
   * Specifies the mock implementation to be used for the mocked dependency.
   *
   * @param mockImplementation - The mock implementation for the mocked dependency.
   * @returns A `TestBedBuilder` instance for chaining further configuration.
   * @template TImpl - The type of the mock implementation.
   */
  using<TImpl extends DeepPartial<TDependency>>(mockImplementation: TImpl): TestBedBuilder<TClass>;

  /**
   * Specifies the mock implementation or value to be used for the mocked dependency.
   *
   * @param mockImplementationOrValue - The mock implementation or value.
   * @returns A `TestBedBuilder` instance for chaining further configuration.
   * @template TImpl - The type of the mock implementation or value.
   */
  using<TImpl extends DeepPartial<TDependency> | ConstantValue>(
    mockImplementationOrValue: TImpl
  ): TestBedBuilder<TClass>;
}

export interface TestBedBuilder<TClass> {
  /**
   * Declares a dependency to be mocked using its type.
   *
   * @param identifier - The type of the dependency to be mocked.
   * @returns A MockOverride instance for further configuration.
   * @template TDependency - The type of the dependency.
   */
  mock<TDependency>(identifier: Type<TDependency>): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a token string.
   *
   * @param identifier - The token string representing the dependency to be mocked.
   * @returns A MockOverride instance for further configuration.
   * @template TDependency - The type of the dependency.
   */
  mock<TDependency>(identifier: string): MockOverride<TDependency, TClass>;

  /**
   * Declares a dependency to be mocked using a token string.
   *
   * @param identifier - The token symbol representing the dependency to be mocked.
   * @returns A MockOverride instance for further configuration.
   * @template TDependency - The type of the dependency.
   */
  mock<TDependency>(identifier: symbol): MockOverride<TDependency, TClass>;

  /**
   * Compiles the unit and creates a new testing unit.
   *
   * @returns A UnitTestBed instance representing the compiled unit.
   */
  compile(): UnitTestBed<TClass>;
}
