import { DependenciesAdapter } from './dependencies-adapter';
import { ClassInjectable } from '@automock/common';

class TargetClassToReflect {}
class ArbitraryClassAsIdentifier {}

const InjectablesFixture = [
  {
    identifier: 'Interface',
    metadata: { metadataKey: 'arbitrary' },
    value: Object,
    type: 'PARAM',
  },
  {
    identifier: 'Interface',
    value: Object,
    type: 'PARAM',
  },
  {
    identifier: ArbitraryClassAsIdentifier,
    metadata: { metadataKey: 'arbitrary' },
    value: Object,
    type: 'PARAM',
  },
  {
    identifier: ArbitraryClassAsIdentifier,
    value: Object,
    type: 'PARAM',
  },
  {
    identifier: 'IdentifierWithMetadata',
    metadata: { tagged: 'value' },
    value: Object,
    type: 'PARAM',
  },
];

describe('Dependencies Adapter Unit Spec', () => {
  const reflectorFactory = DependenciesAdapter(
    { reflectInjectables: () => [] },
    {
      reflectInjectables: () => InjectablesFixture as ClassInjectable[],
    }
  );

  describe('resolving by identifier and/or metadata', () => {
    const container = reflectorFactory.inspect(TargetClassToReflect);

    describe('extended string identifier object, one with metadata and the other without', () => {
      it('should return the specific injectable when identifying with no metadata', () => {
        expect(container.resolve('Interface')).toEqual({
          identifier: 'Interface',
          value: Object,
          type: 'PARAM',
        });
      });

      test('and it should return another injectable, only the metadata object is different, when identifying with metadata object', () => {
        expect(container.resolve('Interface', { metadataKey: 'arbitrary' })).toEqual({
          identifier: 'Interface',
          metadata: { metadataKey: 'arbitrary' },
          value: Object,
          type: 'PARAM',
        });
      });
    });

    describe('extended class identifier object, one with metadata and the other without', () => {
      it('should return the specific injectable when identifying with no metadata', () => {
        expect(container.resolve(ArbitraryClassAsIdentifier)).toEqual({
          identifier: ArbitraryClassAsIdentifier,
          value: Object,
          type: 'PARAM',
        });
      });

      test('and it should return another injectable, only the metadata object is different, when identifying with metadata object', () => {
        expect(container.resolve(ArbitraryClassAsIdentifier, { metadataKey: 'arbitrary' })).toEqual(
          {
            identifier: ArbitraryClassAsIdentifier,
            metadata: { metadataKey: 'arbitrary' },
            value: Object,
            type: 'PARAM',
          }
        );
      });
    });

    describe('existing identifier with and without specifying metadata', () => {
      const subjectInjectable = {
        identifier: 'IdentifierWithMetadata',
        metadata: { tagged: 'value' },
        value: Object,
        type: 'PARAM',
      };

      it('should resolve the injectable by identifier and metadata together', () => {
        expect(container.resolve('IdentifierWithMetadata', { tagged: 'value' })).toEqual(
          subjectInjectable
        );
      });

      test('and it should return the same injectable as well when the metadata is not specified', () => {
        expect(container.resolve('IdentifierWithMetadata')).toEqual(subjectInjectable);
      });

      test('and it should return undefined if there is only injectable that corresponds to the identifier, and the metadata is wrong', () => {
        expect(
          container.resolve('IdentifierWithMetadata', { notExisting: 'value' })
        ).toBeUndefined();
      });
    });
  });
});
