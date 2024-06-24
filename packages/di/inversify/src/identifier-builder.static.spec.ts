import { LazyServiceIdentifer } from 'inversify';
import { IdentifierBuilder } from './identifier-builder.static';

class ArbitraryFakeClass {}

describe('Identifier Builder Unit Spec', () => {
  it('should return an identifier object with identifier and metadata when using inject decorator', () => {
    const inversifyInjectableMetadataItems = [
      { key: 'inject', value: ArbitraryFakeClass },
      { key: 'metadataKey', value: 'metadataValue' },
    ];

    const paramType = ArbitraryFakeClass;

    const result = IdentifierBuilder().toIdentifierObject(
      inversifyInjectableMetadataItems,
      paramType
    );

    expect(result).toEqual({
      identifier: paramType,
      metadata: { metadataKey: 'metadataValue' },
    });
  });

  it('should return an identifier object with identifier and metadata when using multi inject decorator', () => {
    const inversifyInjectableMetadataItems = [
      { key: 'multi_inject', value: ArbitraryFakeClass },
      { key: 'metadataKey', value: 'metadataValue' },
    ];

    const paramType = ArbitraryFakeClass;

    const result = IdentifierBuilder().toIdentifierObject(
      inversifyInjectableMetadataItems,
      paramType
    );

    expect(result).toEqual({
      identifier: paramType,
      metadata: { metadataKey: 'metadataValue' },
    });
  });

  it('should return an identifier object with from lazy loader value when no extra metadata', () => {
    const inversifyInjectableMetadataItems = [
      { key: 'inject', value: new LazyServiceIdentifer(() => ArbitraryFakeClass) },
    ];

    const paramType = ArbitraryFakeClass;

    const result = IdentifierBuilder().toIdentifierObject(
      inversifyInjectableMetadataItems,
      paramType
    );

    expect(result).toEqual({
      identifier: paramType,
      metadata: undefined,
    });
  });

  it('should throw an error indicating undefined dependency detected when lazy loader value is undefined', () => {
    const inversifyInjectableMetadataItems = [
      { key: 'inject', value: new LazyServiceIdentifer(() => undefined as never) },
    ];

    expect(() =>
      IdentifierBuilder().toIdentifierObject(inversifyInjectableMetadataItems, undefined as never)
    ).toThrow();
  });

  it('should use the parameter type as identifier if identifier left undefined because none of the preserved keys is found', () => {
    const inversifyInjectableMetadataItems = [{ key: 'metadataKey', value: 'metadataValue' }];
    const paramType = ArbitraryFakeClass;

    const result = IdentifierBuilder().toIdentifierObject(
      inversifyInjectableMetadataItems,
      paramType
    );

    expect(result).toEqual({
      identifier: paramType,
      metadata: { metadataKey: 'metadataValue' },
    });
  });
});
