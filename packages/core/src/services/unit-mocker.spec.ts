import type { ClassInjectable, InjectableRegistry, WithMetadata } from '@suites/types.di';
import { UndefinedDependency } from '@suites/types.di';
import type { MockedUnit } from './unit-mocker';
import { UnitMocker } from './unit-mocker';
import type { IdentifierToMockOrFinal } from './dependency-container';
import { DependencyContainer } from './dependency-container';

class ArbitraryClassOne {}
class ArbitraryClassTwo {}
class ArbitraryClassThree {}
class ArbitraryClassFour {}
class ArbitraryClassFive {}
class ArbitraryClassSix {}
class ArbitraryClassSeven {}
class ArbitraryClassFourMockedLike {}
class ClassFromToken {}
class StubbedClass {}

class DummyClass {
  public readonly arbitraryThree: ArbitraryClassThree;

  public constructor(
    public readonly arbitraryFour: ArbitraryClassFour,
    public readonly arbitraryProperty: string,
    public readonly withMetadata: StubbedClass,
    public readonly withMetadataSecond: StubbedClass
  ) {}
}

const MockedFromBuilder = Symbol.for('__MOCKED__');

describe('Unit Mocker Unit Spec', () => {
  let underTest: UnitMocker;
  let result: MockedUnit<DummyClass>;

  const injectableRegistry: InjectableRegistry = {
    list(): ClassInjectable[] {
      return [
        {
          type: 'PROPERTY',
          property: { key: 'arbitraryThree' },
          identifier: ArbitraryClassThree,
          value: ArbitraryClassThree,
        },
        { identifier: ArbitraryClassOne, value: ArbitraryClassOne, type: 'PARAM' },
        // We put the same class twice to test that the mocker, it is not a mistake
        { identifier: ArbitraryClassTwo, value: ArbitraryClassTwo, type: 'PARAM' },
        { identifier: ArbitraryClassTwo, value: ArbitraryClassTwo, type: 'PARAM' },
        { identifier: ArbitraryClassFive, value: UndefinedDependency, type: 'PARAM' },
        {
          identifier: 'ArbitraryClassSix',
          metadata: { metadataKey: 'value' },
          value: ArbitraryClassSix,
          type: 'PARAM',
        } as WithMetadata<never>,
        { identifier: 'TOKEN_WITH_UNDEFINED', value: UndefinedDependency, type: 'PARAM' },
        { identifier: 'TOKEN', value: ClassFromToken, type: 'PARAM' },
        {
          type: 'PROPERTY',
          property: { key: 'withMetadata' },
          metadata: { key: 'value' },
          identifier: ArbitraryClassSeven,
          value: ArbitraryClassSeven,
        } as ClassInjectable,
        {
          type: 'PROPERTY',
          property: { key: 'withMetadataSecond' },
          metadata: { anotherKey: 'anotherValue' },
          identifier: 'TOKEN_METADATA',
          value: ArbitraryClassSeven,
        } as ClassInjectable,
        {
          type: 'PROPERTY',
          property: { key: 'arbitraryFour' },
          identifier: ArbitraryClassFour,
          value: ArbitraryClassFour,
        },
        {
          type: 'PROPERTY',
          property: { key: 'arbitraryProperty' },
          identifier: 'ANOTHER_TOKEN',
          value: String,
        },
      ];
    },
    resolve: () => undefined,
  };

  beforeAll(async () => {
    underTest = new UnitMocker(
      Promise.resolve(() => MockedFromBuilder),
      Promise.resolve({
        inspect: () => injectableRegistry,
      })
    );
  });

  describe('given that the adapter returns container with the following dependencies', () => {
    describe('and given there are some already mocked injectables from advanced in the mocks container', () => {
      const mocksContainer = new DependencyContainer([
        [{ identifier: ArbitraryClassTwo }, StubbedClass],
        [{ identifier: ArbitraryClassFour }, ArbitraryClassFourMockedLike],
        [{ identifier: ArbitraryClassSeven, metadata: { key: 'value' } }, StubbedClass],
      ]);

      describe('when applying all the mocks on the target unit, including the already mocked', () => {
        beforeAll(async () => {
          result = await underTest.constructUnit(DummyClass, [], mocksContainer);
        });

        it('should return container that lists all the dependencies together, mocked from the builder or from advanced', () => {
          expect(result.container.list()).toEqual<IdentifierToMockOrFinal[]>([
            [{ identifier: ArbitraryClassOne }, MockedFromBuilder],
            [{ identifier: ArbitraryClassTwo }, StubbedClass],
            [{ identifier: ArbitraryClassFive }, MockedFromBuilder],
            [
              { identifier: 'ArbitraryClassSix', metadata: { metadataKey: 'value' } },
              MockedFromBuilder,
            ],
            [{ identifier: 'TOKEN_WITH_UNDEFINED', metadata: undefined }, MockedFromBuilder],
            [{ identifier: 'TOKEN' }, MockedFromBuilder],
            [{ identifier: ArbitraryClassThree }, MockedFromBuilder],
            [{ identifier: ArbitraryClassSeven, metadata: { key: 'value' } }, StubbedClass],
            [
              { identifier: 'TOKEN_METADATA', metadata: { anotherKey: 'anotherValue' } },
              MockedFromBuilder,
            ],
            [{ identifier: ArbitraryClassFour }, ArbitraryClassFourMockedLike],
            [{ identifier: 'ANOTHER_TOKEN' }, MockedFromBuilder],
          ]);
        });

        it('should return an instance of the class as the unit', () => {
          expect(result.instance).toBeInstanceOf(DummyClass);
        });

        it('should stay mocked', () => {
          expect(result.container.resolve(ArbitraryClassTwo)).toBe(StubbedClass);
          expect(result.container.resolve(ArbitraryClassFour)).toBe(ArbitraryClassFourMockedLike);
          expect(result.container.resolve(ArbitraryClassTwo)).toBe(StubbedClass);
        });

        it('should apply the mocks to the class properties as well', () => {
          expect(result.instance.arbitraryThree).toBe(MockedFromBuilder);
          expect(result.instance.arbitraryFour).toBe(ArbitraryClassFourMockedLike);
          expect(result.instance.arbitraryProperty).toBe(MockedFromBuilder);
          expect(result.instance.withMetadata).toBe(StubbedClass);
          expect(result.instance.withMetadataSecond).toBe(MockedFromBuilder);
        });
      });
    });
  });
});
