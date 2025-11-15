import {
  TestDependService,
  TestService,
  TestSociableService,
} from './assets/injectable-registry.fixture';
import { FakeAdapter } from './assets/integration.assets';
import { mock } from '../mock.static';
import type { UnitReference } from '../../src';
import { SociableTestBedBuilderImpl, UnitMocker } from '../../src';

describe('Social TestBed Builder (Empty Constructor) Integration Tests', () => {
  let unitBuilder: SociableTestBedBuilder<TestService>;
  let testServiceAsIfItWasUnderTest: TestService;
  let unitRef: UnitReference;

  const loggerMock = { warn: jest.fn() } as unknown as jest.Mocked<Console>;

  beforeAll(async () => {
    unitBuilder = new SociableTestBedBuilderImpl(
      Promise.resolve({
        mock: mock,
        stub: jest.fn,
      }),
      new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
      TestService,
      loggerMock
    );

    const testBed = await unitBuilder.expose(TestSociableService).compile();

    testServiceAsIfItWasUnderTest = testBed.unit;
    unitRef = testBed.unitRef;
  });

  it('should instantiate UserService with all dependencies properly resolved', () => {
    expect(testServiceAsIfItWasUnderTest).toBeInstanceOf(TestService);
  });

  it('should instantiate UserService with all dependencies properly resolved', () => {
    const testDependServiceMock = unitRef.get(TestDependService);

    testServiceAsIfItWasUnderTest.test();
    expect(testDependServiceMock.call).toHaveBeenCalledWith(true);
  });
});
