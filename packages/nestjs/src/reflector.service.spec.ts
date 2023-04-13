import { Type } from '@automock/types';
// TODO: Move to '@automock/core'
import { Reflectable } from '@automock/jest';
import { ReflectorService } from './reflector.service';
import { CustomToken, TokensReflector } from './token-reflector.service';

@Reflectable()
export class TestClassOne {
  async foo(flag: boolean): Promise<string> {
    if (flag) {
      return Promise.resolve('foo-with-flag');
    }

    return Promise.resolve('foo');
  }
}

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

describe('NestJS Reflector Unit Spec', () => {
  const getMetadataStub = jest.fn();
  let reflector: ReflectorService;

  beforeAll(() => {
    reflector = new ReflectorService({ getMetadata: getMetadataStub } as never, TokensReflector);
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
