import type { IdentifierToMockOrFinal } from './dependency-container';
import { DependencyContainer } from './dependency-container';

class ArbitraryClassAsIdentifier {}
class DummyIdentifier {}

describe('Dependency Container Unit Spec', () => {
  it('should return the corresponding value when the identifier matches a single identifier and metadata is not provided', () => {
    const identifierToMocksTuples: IdentifierToMockOrFinal[] = [
      [{ identifier: ArbitraryClassAsIdentifier }, 'mock1'],
      [{ identifier: 'dependency2' }, 'mock2'],
    ];

    const dependencyContainer = new DependencyContainer(identifierToMocksTuples);
    const result = dependencyContainer.resolve(ArbitraryClassAsIdentifier);

    expect(result).toBe('mock1');
  });

  it('should return the value of the first matching identifier when the identifier matches multiple identifiers and metadata is not provided', () => {
    const identifierToMocksTuples: IdentifierToMockOrFinal[] = [
      [{ identifier: 'dependency1' }, 'mock1'],
      [{ identifier: 'dependency1' }, 'mock2'],
    ];

    const dependencyContainer = new DependencyContainer(identifierToMocksTuples);
    const result = dependencyContainer.resolve('dependency1');

    expect(result).toBe('mock1');
  });

  it('should return undefined when the identifier does not match any identifier', () => {
    const identifierToMocksTuples: IdentifierToMockOrFinal[] = [
      [{ identifier: 'dependency1' }, 'mock1'],
      [{ identifier: 'dependency2' }, 'mock2'],
    ];

    const dependencyContainer = new DependencyContainer(identifierToMocksTuples);
    const result = dependencyContainer.resolve('dependency3');

    expect(result).toBeUndefined();
  });

  it('should return undefined when the identifier matches a single identifier but metadata does not match', () => {
    const identifierToMocksTuples: IdentifierToMockOrFinal[] = [
      [{ identifier: 'dependency1', metadata: { metadataKey: 'arbitrary' } }, 'mock1'],
    ];

    const dependencyContainer = new DependencyContainer(identifierToMocksTuples);
    const result = dependencyContainer.resolve('dependency1', { metadataKey: 'arbitraryWrong' });

    expect(result).toBeUndefined();
  });

  it('should return undefined when the identifier matches multiple identifiers but metadata does not match any of them', () => {
    const identifierToMocksTuples: IdentifierToMockOrFinal[] = [
      [{ identifier: 'dependency1', metadata: 'metadata1' }, 'mock1'],
      [{ identifier: 'dependency1', metadata: 'metadata2' }, 'mock2'],
    ];

    const dependencyContainer = new DependencyContainer(identifierToMocksTuples);
    const result = dependencyContainer.resolve('dependency1', { metadataKey: 'arbitrary' });

    expect(result).toBeUndefined();
  });

  it('should return the value of the identifier when there are two identifiers with the same token but different metadata', () => {
    const identifierToMocksTuples: IdentifierToMockOrFinal[] = [
      [{ identifier: DummyIdentifier, metadata: { key: 'metadata1' } }, 'mock1'],
      [{ identifier: DummyIdentifier, metadata: { key: 'metadata2' } }, 'mock2'],
    ];

    const dependencyContainer = new DependencyContainer(identifierToMocksTuples);
    const result = dependencyContainer.resolve(DummyIdentifier, { key: 'metadata1' });

    expect(result).toBe('mock1');
  });

  it('should return undefined when there are two identifiers with the same token and resolved with no metadata', () => {
    const identifierToMocksTuples: IdentifierToMockOrFinal[] = [
      [{ identifier: DummyIdentifier, metadata: { key: 'metadata1' } }, 'mock1'],
      [{ identifier: DummyIdentifier, metadata: { key: 'metadata2' } }, 'mock2'],
    ];

    const dependencyContainer = new DependencyContainer(identifierToMocksTuples);
    const result = dependencyContainer.resolve(DummyIdentifier);

    expect(result).toBeUndefined();
  });
});
