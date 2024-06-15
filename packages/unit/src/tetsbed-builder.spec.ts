import { testBedBuilderFactory } from './testbed-builder';

const initiationStub = jest.fn();

class TargetClass {}

class FakeBuilderType {
  public constructor(
    private doublesAdapter: never,
    private unitMocker: never,
    private targetClass: never,
    private console: never
  ) {
    initiationStub(doublesAdapter, unitMocker, targetClass, console);
  }
}

describe('Testbed Builder Unit Spec', () => {
  let result: FakeBuilderType;

  beforeAll(async () => {
    result = await testBedBuilderFactory(
      { jest: '@suites/doubles.jest' } as never,
      { nestjs: '@suites/di.nestjs' } as never,
      TargetClass
    ).create(FakeBuilderType as never);
  });

  it('should call the constructor of the fake builder type', () => {
    expect(initiationStub).toHaveBeenCalledWith(
      Promise.resolve({ jest: '@suites/doubles.jest' }),
      expect.any(Object),
      TargetClass,
      expect.any(Object)
    );
  });

  it('should create new testbed builder with the given fake builder type', () => {
    expect(result).toBeInstanceOf(FakeBuilderType);
  });
});
