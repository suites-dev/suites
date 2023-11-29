import { IdentifierToMock, MocksContainer } from './mocks-container';

class ArbitraryClassAsIdentifier {}

const IdentifiersToMocksFixture: IdentifierToMock[] = [
  [{ identifier: ArbitraryClassAsIdentifier, metadata: { metadataKey: 'arbitrary' } }, '__DEP1__'],
  [{ identifier: 'Interface' }, '__DEP2__'],
  [{ identifier: 'Interface', metadata: { metadataKey: 'arbitrary' } }, '__DEP3__'],
];

describe('Mocks Container Unit Spec', () => {
  const mocksContainer = new MocksContainer(IdentifiersToMocksFixture);

  describe('when there are two identifiers that are the same, one with metadata and one without', () => {
    it('should return the mock value corresponds to an identifier that has no metadata', () => {
      expect(mocksContainer.resolve('Interface')).toBe('__DEP2__');
    });

    test('and it should return another, distinct mock value that corresponds to the same base identifier but with no metadata', () => {
      expect(mocksContainer.resolve('Interface', { metadataKey: 'arbitrary' })).toBe('__DEP3__');
    });
  });

  describe('when there is one mock value corresponds to an identifier, and has metadata', () => {
    it('should return a mock value when resolving the mock by identifier and metadata', () => {
      expect(mocksContainer.resolve(ArbitraryClassAsIdentifier, { metadataKey: 'arbitrary' })).toBe(
        '__DEP1__'
      );
    });

    test('and it should return the exact same mock value when a metadata is not specified', () => {
      expect(mocksContainer.resolve(ArbitraryClassAsIdentifier)).toBe('__DEP1__');
    });

    test('and it should return undefined if there is only one mock value that corresponds to the identifier, and the metadata is wrong', () => {
      expect(
        mocksContainer.resolve(ArbitraryClassAsIdentifier, { notExisting: 'value' })
      ).toBeUndefined();
    });
  });
});
