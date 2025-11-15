import { LazyServiceIdentifier } from '@inversifyjs/common';
import { ClassElementMetadataKind } from '@inversifyjs/core';
import type { Type } from '@suites/types.common';
import type { IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';
import type { InversifyClassElementMetadata } from './types.js';

export type IdentifierObject = {
  identifier: InjectableIdentifier;
  metadata: IdentifierMetadata | undefined;
};

export type IdentifierBuilder = ReturnType<typeof IdentifierBuilder>;

export function IdentifierBuilder() {
  function toIdentifierObject(
    elementMetadata: InversifyClassElementMetadata,
    paramType: Type
  ): IdentifierObject {
    // Handle unmanaged dependencies
    if (elementMetadata.kind === ClassElementMetadataKind.unmanaged) {
      return { identifier: paramType, metadata: undefined };
    }

    // Extract identifier from metadata
    let identifier: InjectableIdentifier;
    const { value } = elementMetadata;

    if (value instanceof LazyServiceIdentifier) {
      const unwrappedValue = value.unwrap();

      if (typeof unwrappedValue === 'undefined') {
        throw new Error('Undefined dependency identifier detected');
      }

      identifier = unwrappedValue as InjectableIdentifier;
    } else {
      identifier = value as InjectableIdentifier;
    }

    // Build metadata object from name and tags
    let metadata: IdentifierMetadata = {};

    if ('name' in elementMetadata && elementMetadata.name !== undefined) {
      metadata.name = elementMetadata.name;
    }

    if ('tags' in elementMetadata && elementMetadata.tags.size > 0) {
      metadata = { ...metadata, ...Object.fromEntries(elementMetadata.tags) };
    }

    return {
      identifier,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };
  }

  return { toIdentifierObject };
}
