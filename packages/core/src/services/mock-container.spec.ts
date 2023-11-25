import { IdentifierToMock, MocksContainer } from './mocks-container';

class ArbitraryClassAsIdentifier {}

describe('Mocks Container Unit Spec', () => {
  it('should return the corresponding value when the identifier matches a single identifier and metadata is not provided', () => {
    const identifierToMocksTuples: IdentifierToMock[] = [
      [{ identifier: ArbitraryClassAsIdentifier }, 'mock1'],
      [{ identifier: 'dependency2' }, 'mock2'],
    ];
    const mocksContainer = new MocksContainer(identifierToMocksTuples);

    const result = mocksContainer.resolve(ArbitraryClassAsIdentifier);

    expect(result).toBe('mock1');
  });

  it('should return the value of the first matching identifier when the identifier matches multiple identifiers and metadata is not provided', () => {
    const identifierToMocksTuples: IdentifierToMock[] = [
      [{ identifier: 'dependency1' }, 'mock1'],
      [{ identifier: 'dependency1' }, 'mock2'],
    ];

    const mocksContainer = new MocksContainer(identifierToMocksTuples);

    const result = mocksContainer.resolve('dependency1');

    expect(result).toBe('mock1');
  });

  it('should return undefined when the identifier does not match any identifier', () => {
    const identifierToMocksTuples: IdentifierToMock[] = [
      [{ identifier: 'dependency1' }, 'mock1'],
      [{ identifier: 'dependency2' }, 'mock2'],
    ];
    const mocksContainer = new MocksContainer(identifierToMocksTuples);

    const result = mocksContainer.resolve('dependency3');

    expect(result).toBeUndefined();
  });

  it('should return undefined when the identifier matches a single identifier but metadata does not match', () => {
    const identifierToMocksTuples: IdentifierToMock[] = [
      [{ identifier: 'dependency1', metadata: { metadataKey: 'arbitrary' } }, 'mock1'],
    ];
    const mocksContainer = new MocksContainer(identifierToMocksTuples);

    const result = mocksContainer.resolve('dependency1', { metadataKey: 'arbitraryWrong' });

    expect(result).toBeUndefined();
  });

  it('should return undefined when the identifier matches multiple identifiers but metadata does not match any of them', () => {
    const identifierToMocksTuples: IdentifierToMock[] = [
      [{ identifier: 'dependency1', metadata: 'metadata1' }, 'mock1'],
      [{ identifier: 'dependency1', metadata: 'metadata2' }, 'mock2'],
    ];
    const mocksContainer = new MocksContainer(identifierToMocksTuples);

    const result = mocksContainer.resolve('dependency1', { metadataKey: 'arbitrary' });

    expect(result).toBeUndefined();
  });
});
