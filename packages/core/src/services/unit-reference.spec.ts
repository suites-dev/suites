/* eslint-disable prefer-const */
import { InjectableIdentifier } from '@suites/types.di';
import { ConstantValue } from '@suites/types.common';
import { StubbedInstance } from '@suites/types.doubles';
import { UnitReference } from './unit-reference';
import { MocksContainer } from './mocks-container';

class DependencyOne {
  yaron(): void {}
}
class DependencyOneStubbed {}
class DependencyTwoStubbed {}

const DependencyOneSymbol = Symbol('DependencyOneSymbol');
const DependencyTwoSymbol = Symbol('DependencyTwoSymbol');
const ConstantValueSymbol = Symbol('ConstantValueSymbol');

describe('Unit Reference Unit Spec', () => {
  let unitReference: UnitReference;

  beforeAll(() => {
    const mocksContainer = new MocksContainer([
      // Types
      [{ identifier: DependencyOne }, DependencyOneStubbed],
      [{ identifier: 'DEPENDENCY_ONE' }, DependencyOneStubbed],
      [{ identifier: DependencyOneSymbol }, DependencyOneStubbed],
      // Constants
      [{ identifier: 'CONSTANT_VALUE' }, ['1', '2', '3']],
      [{ identifier: ConstantValueSymbol }, [1, 2, 3]],
      // With Metadata
      [{ identifier: 'DEPENDENCY_TWO', metadata: { dependency: 'two' } }, DependencyTwoStubbed],
      [{ identifier: DependencyTwoSymbol, metadata: { dependency: 'two' } }, DependencyTwoStubbed],
    ]);

    unitReference = new UnitReference(mocksContainer);
  });

  it.each([
    [DependencyOne, DependencyOneStubbed],
    ['DEPENDENCY_ONE', DependencyOneStubbed],
    [DependencyOneSymbol, DependencyOneStubbed],
    ['CONSTANT_VALUE', ['1', '2', '3']],
    [ConstantValueSymbol, [1, 2, 3]],
  ])(
    'should return the corresponding class or value using unique identifier with no metadata',
    (identifier: InjectableIdentifier, value: StubbedInstance<unknown> | ConstantValue) => {
      expect(unitReference.get(identifier)).toEqual(value);
    }
  );

  it('should return the corresponding class or value using unique identifier with metadata combined', () => {
    expect(
      unitReference.get<DependencyTwoStubbed>('DEPENDENCY_TWO', {
        dependency: 'two',
      })
    ).toEqual(DependencyTwoStubbed);

    expect(
      unitReference.get<DependencyTwoStubbed>(DependencyTwoSymbol, { dependency: 'two' })
    ).toEqual(DependencyTwoStubbed);
  });

  it('should throw an error indicating the dependency not found in case the identifier is missing', () => {
    expect(() => unitReference.get('does-not-exist')).toThrowError();
  });

  describe('Spread Method', () => {
    /*
    To enable the spread method to accept multiple dependencies and return them in an array,
    we need to use the spread operator.

    An important thing to note is that the spread method is a variadic function that accepts
    multiple identifiers and returns an array of dependencies.

    We can not get it as an object because the order of the dependencies is not guaranteed.
  */

    it('should spread a single dependency', () => {
      const dependencyOne = unitReference.spread(DependencyOne);
      expect(dependencyOne).toEqual([DependencyOneStubbed]);
    });

    it('should spread a single dependency with metadata', () => {
      const dependencyTwo = unitReference.spread('DEPENDENCY_TWO', { dependency: 'two' });
      expect(dependencyTwo).toEqual([DependencyTwoStubbed]);
    });

    it('should spread multiple dependencies', () => {
      const [dependencyOne, constantValue] = unitReference.spread(
        DependencyOne,
        ConstantValueSymbol
      );
      expect(dependencyOne).toEqual(DependencyOneStubbed);
      expect(constantValue).toEqual([1, 2, 3]);
    });

    it('should spread multiple dependencies with metadata', () => {
      const [dependencyOne, dependencyTwo] = unitReference.spread(
        DependencyOneSymbol,
        'DEPENDENCY_TWO',
        { dependency: 'two' }
      );
      expect(dependencyOne).toEqual(DependencyOneStubbed);
      expect(dependencyTwo).toEqual(DependencyTwoStubbed);
    });

    it('should spread multiple dependencies with metadata in any order', () => {
      const [dependencyTwo, dependencyOne] = unitReference.spread(
        'DEPENDENCY_TWO',
        DependencyOneSymbol,
        { dependency: 'two' }
      );
      expect(dependencyOne).toEqual(DependencyOneStubbed);
      expect(dependencyTwo).toEqual(DependencyTwoStubbed);
    });

    it('should spread multiple dependencies with metadata and constants', () => {
      let dependencyOne: StubbedInstance<DependencyOne>;
      let constantValue: ConstantValue;
      [dependencyOne, constantValue] = unitReference.spread(DependencyOne, ConstantValueSymbol);

      expect(dependencyOne).toEqual(DependencyOneStubbed);
      expect(constantValue).toEqual([1, 2, 3]);
    });
  });
});
