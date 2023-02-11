import { CustomToken, TokensReflector } from '../src/services/token-reflector.module';
import { ReflectorService } from '../src/services/reflector.service';
import { TestClassOne } from './testing-classes.assets';
import { Type } from '../src/types';

import Mocked = jest.Mocked;

const VALID_IMPL = (metadataKey: string) => {
  if (metadataKey === 'self:paramtypes') {
    return [{ index: 1, param: 'LOGGER' }] as CustomToken[];
  } else if (metadataKey === 'design:paramtypes') {
    return [TestClassOne, Object] as Type<unknown>[];
  }
};

const INVALID_IMPL = (metadataKey: string) => {
  if (metadataKey === 'self:paramtypes') {
    return [] as CustomToken[];
  } else if (metadataKey === 'design:paramtypes') {
    return [TestClassOne, Object] as Type<unknown>[];
  }
};

class TestedClass {}

describe('Reflector Service TestBed', () => {
  const getMetadataStub = jest.fn();
  let reflector: ReflectorService;

  beforeAll(() => {
    reflector = new ReflectorService(
      { getMetadata: getMetadataStub } as unknown as Mocked<typeof Reflect>,
      TokensReflector()
    );
  });

  describe('scenario: successfully reflecting dependencies and tokens', () => {
    describe('when not overriding any of the class dependencies', () => {
      let result: Map<string | Type<unknown>, string | Type<unknown>>;

      beforeAll(() => {
        getMetadataStub.mockImplementation(VALID_IMPL);
        result = reflector.reflectDependencies(TestedClass);
      });

      test('then map the dependencies accordingly', () => {
        const keys = Array.from(result.keys());
        const values = Array.from(result.values());

        expect(keys).toEqual([TestClassOne, 'LOGGER']);
        expect(values).toEqual([TestClassOne, Object]);
      });
    });
  });

  describe('scenario: fail to reflect tokens', () => {
    describe('when reflector cannot find the custom tokens', () => {
      beforeAll(() => {
        getMetadataStub.mockImplementation(INVALID_IMPL);
      });

      test('then throw an error', () => {
        expect(() => reflector.reflectDependencies(class TestedClass {})).toThrow();
      });
    });
  });
});
