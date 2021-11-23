import { MainTestClass, TestClassOne, UnitBuilder } from './spec-assets';
import { TestingUnit } from '../src';

describe.skip('E2E Test', () => {
  let unit: TestingUnit<MainTestClass>;

  beforeAll(() => {
    unit = UnitBuilder.compile();
  });

  describe('', () => {
    test('then ', () => {
      expect(unit.unit).toBeInstanceOf(MainTestClass);
    });

    test('then ', async () => {
      const { unitRef } = unit;
      const testClassOneRef = unitRef.get(TestClassOne);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const fn = function calledWith() {};

      expect({
        ...testClassOneRef.foo,
      }).toMatchObject(expect.objectContaining({ ...jest.fn(), calledWith: fn }));
    });
  });
});
