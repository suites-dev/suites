import type { InjectableIdentifier } from '@suites/types.di';
import type { ConstantValue } from '@suites/types.common';
import type { StubbedInstance } from '@suites/types.doubles';
import { UnitReference } from './unit-reference';
import { DependencyContainer, type IdentifierToFinal } from './dependency-container';

class DependencyOne {}
class DependencyOneStubbed {}
class DependencyTwoStubbed {}
class RealDependencyOne {}
class RealDependencyTwo {}
class RealDependencyThree {}
class RealDependencyFour {}

const DependencyOneSymbol = Symbol('DependencyOneSymbol');
const DependencyTwoSymbol = Symbol('DependencyTwoSymbol');
const ConstantValueSymbol = Symbol('ConstantValueSymbol');

describe('Unit Reference Unit Spec', () => {
  let unitReference: UnitReference;

  beforeAll(() => {
    const mocksContainer = new DependencyContainer([
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

    const fakedDependencies: IdentifierToFinal[] = [
      [{ identifier: RealDependencyThree }, 'fake-value-1'],
      [{ identifier: RealDependencyFour }, 'another-fake-value-2'],
    ];

    unitReference = new UnitReference(
      mocksContainer,
      [RealDependencyOne, RealDependencyTwo],
      fakedDependencies
    );
  });

  it('should throw an error indicating the dependency cannot be retrieved because it is faked', () => {
    expect(() => unitReference.get(RealDependencyThree)).toThrowError(
      /as it is marked as a faked dependency/
    );
    expect(() => unitReference.get(RealDependencyFour)).toThrowError(
      /as it is marked as a faked dependency/
    );
  });

  it('should throw an error indicating the dependency cannot be retrieved because it is exposed', () => {
    expect(() => unitReference.get(RealDependencyOne)).toThrowError(
      /as it is marked as an exposed dependency/
    );
  });

  it.each([
    [DependencyOne, DependencyOneStubbed],
    ['DEPENDENCY_ONE', DependencyOneStubbed],
    [DependencyOneSymbol, DependencyOneStubbed],
    ['CONSTANT_VALUE', ['1', '2', '3']],
    [ConstantValueSymbol, [1, 2, 3]],
  ])(
    'should return the corresponding class or value impl unique identifier with no metadata',
    (identifier: InjectableIdentifier, value: StubbedInstance<unknown> | ConstantValue) => {
      expect(unitReference.get(identifier)).toEqual(value);
    }
  );

  it('should return the corresponding class or value impl unique identifier with metadata combined', () => {
    expect(
      unitReference.get<DependencyTwoStubbed>('DEPENDENCY_TWO', {
        dependency: 'two' as never,
      })
    ).toEqual(DependencyTwoStubbed);

    expect(
      unitReference.get<DependencyTwoStubbed>(DependencyTwoSymbol, { dependency: 'two' } as never)
    ).toEqual(DependencyTwoStubbed);
  });

  it('should throw an error indicating the dependency not found in case the identifier is missing', () => {
    expect(() => unitReference.get('does-not-exist')).toThrowError(
      /is correctly mocked or explicitly exposed in the/
    );
  });
});
