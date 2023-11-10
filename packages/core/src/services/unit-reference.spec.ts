import { UnitReference } from './unit-reference';
import { MocksContainer } from './mocks-container';
import { ConstantValue, InjectableIdentifier } from '@automock/common';
import { StubbedInstance } from '@automock/types';

class DependencyOne {}
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
});
