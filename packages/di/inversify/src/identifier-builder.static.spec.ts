import { LazyServiceIdentifier } from '@inversifyjs/common';
import { ClassElementMetadataKind } from '@inversifyjs/core';
import { IdentifierBuilder } from './identifier-builder.static';

class ArbitraryFakeClass {}

describe('Identifier Builder Unit Spec', () => {
  it('should return an identifier object with identifier and metadata when using inject decorator with tagged metadata', () => {
    const elementMetadata = {
      kind: ClassElementMetadataKind.singleInjection,
      value: ArbitraryFakeClass,
      optional: false,
      name: undefined,
      tags: new Map([['metadataKey', 'metadataValue']]),
    };

    const paramType = ArbitraryFakeClass;

    const result = IdentifierBuilder().toIdentifierObject(elementMetadata, paramType);

    expect(result).toEqual({
      identifier: paramType,
      metadata: { metadataKey: 'metadataValue' },
    });
  });

  it('should return an identifier object with identifier and metadata when using inject decorator with named metadata', () => {
    const elementMetadata = {
      kind: ClassElementMetadataKind.singleInjection,
      value: ArbitraryFakeClass,
      optional: false,
      name: 'namedValue',
      tags: new Map(),
    };

    const paramType = ArbitraryFakeClass;

    const result = IdentifierBuilder().toIdentifierObject(elementMetadata, paramType);

    expect(result).toEqual({
      identifier: paramType,
      metadata: { name: 'namedValue' },
    });
  });

  it('should return an identifier object with identifier and metadata when using multi inject decorator', () => {
    const elementMetadata = {
      kind: ClassElementMetadataKind.multipleInjection,
      value: ArbitraryFakeClass,
      optional: false,
      name: undefined,
      tags: new Map([['metadataKey', 'metadataValue']]),
      chained: false,
    };

    const paramType = ArbitraryFakeClass;

    const result = IdentifierBuilder().toIdentifierObject(elementMetadata, paramType);

    expect(result).toEqual({
      identifier: paramType,
      metadata: { metadataKey: 'metadataValue' },
    });
  });

  it('should return an identifier object with from lazy loader value when no extra metadata', () => {
    const elementMetadata = {
      kind: ClassElementMetadataKind.singleInjection,
      value: new LazyServiceIdentifier(() => ArbitraryFakeClass),
      optional: false,
      name: undefined,
      tags: new Map(),
    };

    const paramType = ArbitraryFakeClass;

    const result = IdentifierBuilder().toIdentifierObject(elementMetadata, paramType);

    expect(result).toEqual({
      identifier: paramType,
      metadata: undefined,
    });
  });

  it('should throw an error indicating undefined dependency detected when lazy loader value is undefined', () => {
    const elementMetadata = {
      kind: ClassElementMetadataKind.singleInjection,
      value: new LazyServiceIdentifier(() => undefined as never),
      optional: false,
      name: undefined,
      tags: new Map(),
    };

    expect(() =>
      IdentifierBuilder().toIdentifierObject(elementMetadata, undefined as never)
    ).toThrow('Undefined dependency identifier detected');
  });

  it('should return identifier from element metadata when no tags or name are present', () => {
    const elementMetadata = {
      kind: ClassElementMetadataKind.singleInjection,
      value: 'CUSTOM_TOKEN',
      optional: false,
      name: undefined,
      tags: new Map(),
    };
    const paramType = ArbitraryFakeClass;

    const result = IdentifierBuilder().toIdentifierObject(elementMetadata, paramType);

    expect(result).toEqual({
      identifier: 'CUSTOM_TOKEN',
      metadata: undefined,
    });
  });

  it('should return paramType as identifier for unmanaged dependencies', () => {
    const elementMetadata = {
      kind: ClassElementMetadataKind.unmanaged,
    };
    const paramType = ArbitraryFakeClass;

    const result = IdentifierBuilder().toIdentifierObject(elementMetadata, paramType);

    expect(result).toEqual({
      identifier: paramType,
      metadata: undefined,
    });
  });
});
