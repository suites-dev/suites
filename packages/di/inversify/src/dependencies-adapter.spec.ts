import type { DependencyInjectionAdapter, ClassInjectable } from '@suites/types.di';
import { DependenciesAdapter } from './dependencies-adapter';
import type { IdentifierMetadata } from './types';

const classPropsReflector = { reflectInjectables: jest.fn() };
const classCtorReflector = { reflectInjectables: jest.fn() };

const dependenciesAdapter: DependencyInjectionAdapter = DependenciesAdapter(
  classPropsReflector,
  classCtorReflector
);

const targetClass = class TargetClassToReflect {};
const arbitraryClassAsIdentifier = class ArbitraryClassAsIdentifier {};
const metadata: IdentifierMetadata = { metadataKey: 'arbitrary' };

const injectablesFixture: ClassInjectable[] = [
  {
    identifier: 'Interface',
    metadata: { metadataKey: 'arbitrary' } as never,
    value: Object,
    type: 'PARAM',
  },
  {
    identifier: 'Interface',
    metadata: { metadataKey: 'anotherOne' } as never,
    value: Object,
    type: 'PARAM',
  },
  {
    identifier: 'Interface',
    value: Object,
    type: 'PARAM',
  },
  {
    identifier: arbitraryClassAsIdentifier,
    metadata: { metadataKey: 'arbitrary' } as never,
    value: Object,
    type: 'PARAM',
  },
  {
    identifier: arbitraryClassAsIdentifier,
    value: Object,
    type: 'PARAM',
  },
  {
    identifier: 'IdentifierWithMetadata',
    metadata: { tagged: 'value' } as never,
    value: Object,
    type: 'PARAM',
  },
];

describe('Dependencies Adapter Unit Spec', () => {
  beforeEach(() => {
    classPropsReflector.reflectInjectables.mockReturnValue([]);
    classCtorReflector.reflectInjectables.mockReset();
  });

  it('should return undefined if no matching injectables are found', () => {
    classCtorReflector.reflectInjectables.mockReturnValue([]);
    const result = dependenciesAdapter.inspect(targetClass).resolve('Interface', metadata as never);

    expect(result).toBeUndefined();
  });

  it('should return the injectable if only one matching injectable is found and no metadata is provided', () => {
    classCtorReflector.reflectInjectables.mockReturnValue(injectablesFixture);
    const result = dependenciesAdapter.inspect(targetClass).resolve('Interface');

    expect(result).toEqual(injectablesFixture[2]);
  });

  it('should return the injectable with matching metadata if metadata is provided', () => {
    classCtorReflector.reflectInjectables.mockReturnValue(injectablesFixture);
    const result = dependenciesAdapter.inspect(targetClass).resolve('Interface', metadata as never);

    expect(result).toEqual(injectablesFixture[0]);
  });

  it('should return undefined if no injectable with matching metadata is found', () => {
    classCtorReflector.reflectInjectables.mockReturnValue(injectablesFixture);
    const result = dependenciesAdapter
      .inspect(targetClass)
      .resolve('Interface', { metadataKey: 'other' } as never);

    expect(result).toBeUndefined();
  });

  it('should return the injectable with matching identifier and no metadata if metadata is not provided', () => {
    classCtorReflector.reflectInjectables.mockReturnValue(injectablesFixture);
    const result = dependenciesAdapter.inspect(targetClass).resolve(arbitraryClassAsIdentifier);

    expect(result).toEqual(injectablesFixture[4]);
  });

  it('should return the injectable if there is exactly one, even no metadata provided', () => {
    classCtorReflector.reflectInjectables.mockReturnValue(injectablesFixture);
    const result = dependenciesAdapter.inspect(targetClass).resolve('IdentifierWithMetadata');

    expect(result).toEqual(injectablesFixture[5]);
  });
});
