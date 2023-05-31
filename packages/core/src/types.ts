import { UnitReference } from './services/unit-reference';

/**
 * Represents the result of compiling a unit test bed.
 * @template TClass - The type of the class under test.
 */
export interface UnitTestBed<TClass> {
  /**
   * The instance of the class under test.
   */
  unit: TClass;

  /**
   * The reference to the dependencies of the class under test.
   */
  unitRef: UnitReference;
}
