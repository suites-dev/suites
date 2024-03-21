import { LazyServiceIdentifer } from 'inversify';
import { Type } from '@suites/types.common';
import { IdentifierMetadata, InjectableIdentifier, WithMetadata } from '@suites/types.di';
import { INVERSIFY_PRESERVED_KEYS, InversifyInjectableMetadata } from './types';

export type IdentifierObject = {
  identifier: InjectableIdentifier;
  metadata: undefined | Pick<WithMetadata<IdentifierMetadata>, 'metadata'>;
};

export type IdentifierBuilder = ReturnType<typeof IdentifierBuilder>;

export function IdentifierBuilder() {
  function toIdentifierObject(
    inversifyInjectableMetadataItems: InversifyInjectableMetadata[],
    paramType: Type
  ): IdentifierObject {
    const obj = inversifyInjectableMetadataItems.reduce(
      (acc: IdentifierObject, metadataItem: InversifyInjectableMetadata) => {
        const { key: metadataKey, value: metadataValue } = metadataItem;

        if (INVERSIFY_PRESERVED_KEYS.includes(metadataKey)) {
          if (metadataValue instanceof LazyServiceIdentifer) {
            const unwrappedValue = metadataValue.unwrap();

            if (typeof unwrappedValue === 'undefined') {
              throw new Error('Undefined dependency identifier detected');
            }

            return { ...acc, identifier: unwrappedValue };
          }

          return { ...acc, identifier: metadataValue };
        }

        return { ...acc, metadata: { [metadataKey]: metadataValue } };
      },
      {} as IdentifierObject
    ) as IdentifierObject;

    if (typeof obj.identifier === 'undefined') {
      return { identifier: paramType, metadata: obj.metadata };
    }

    return obj;
  }

  return { toIdentifierObject };
}
