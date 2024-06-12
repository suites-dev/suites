import type { StubbedInstance } from '@suites/types.doubles';
import { FakeAdapter } from './assets/integration.assets';
import { mock } from './assets/mock.static';
import type { Repository, User } from './assets/injectable-registry.fixture';
import { Axios } from './assets/injectable-registry.fixture';
import { HttpClient } from './assets/injectable-registry.fixture';
import {
  TestLogger,
  UserApiService,
  UserDal,
  UserService,
  UserVerificationService,
  ApiService,
  DatabaseService,
} from './assets/injectable-registry.fixture';
import type { UnitReference } from '../../src';
import { SociableTestBedBuilder, UnitMocker } from '../../src';

describe('Social TestBed Builder Integration Tests', () => {
  let unitBuilder: SociableTestBedBuilder<UserService>;
  let userServiceAsIfItWasUnderTest: UserService;
  let unitRef: UnitReference;

  const loggerMock = { warn: jest.fn() } as unknown as jest.Mocked<Console>;

  beforeAll(async () => {
    unitBuilder = new SociableTestBedBuilder(
      Promise.resolve(mock),
      new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
      UserService,
      loggerMock
    );

    const testBed = await unitBuilder
      .expose(UserApiService)
      .expose(UserDal)
      .expose(HttpClient)
      .expose(DatabaseService)
      .mock(TestLogger)
      .using({ log: jest.fn().mockReturnValue('overridden') })
      .mock(Axios)
      .using({})
      .compile();

    userServiceAsIfItWasUnderTest = testBed.unit;
    unitRef = testBed.unitRef;
  });

  it('should instantiate UserService with all dependencies properly resolved', () => {
    expect(userServiceAsIfItWasUnderTest).toBeInstanceOf(UserService);
  });

  it('should have log a warning message about http client cannot be exposed because it is not a direct dependency', () => {
    expect(loggerMock.warn).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('Suites Warning: Unreachable Mock Configuration Detected')
    );
    expect(loggerMock.warn).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('Suites Warning: Unreachable Exposed Dependency Detected')
    );
  });

  it('should log messages using the overridden Logger.log method when UserService is initialized', () => {
    const mockedLogger: StubbedInstance<TestLogger> = unitRef.get<TestLogger>(TestLogger);

    expect(mockedLogger.log).toHaveBeenNthCalledWith(1, 'Just logging a message');
    expect(mockedLogger.log).toHaveBeenNthCalledWith(2, 'UserService initialized');
  });

  it('should throw an error indicating the dependencies cannot be retrieved as they were exposed in the testbed', () => {
    expect(() => unitRef.get(DatabaseService)).toThrowError();
    expect(() => unitRef.get(UserDal)).toThrowError();
    expect(() => unitRef.get(UserApiService)).toThrowError();
  });

  describe('creating a user with UserService', () => {
    let repository: StubbedInstance<Repository>;
    let userVerService: jest.Mocked<UserVerificationService>;
    let createdUser: User;

    const userFixture = { name: 'Test User', email: 'test@example.com' } as const;

    beforeAll(async () => {
      userVerService = unitRef.get(
        UserVerificationService
      ) as unknown as jest.Mocked<UserVerificationService>;

      repository = unitRef.get<Repository>('Repository');

      userVerService.verify.mockReturnValue(true);
      createdUser = await userServiceAsIfItWasUnderTest.create(userFixture);
    });

    it('should call the verification service to verify the user data because it is mocked', () => {
      expect(userVerService.verify).toHaveBeenCalledWith(userFixture);
    });

    it('should go through the repository because the database service is exposed', () => {
      expect(repository.create).toHaveBeenCalledWith(JSON.stringify(userFixture));
    });

    it('should successfully create and return the same user', () => {
      expect(createdUser).toEqual(userFixture);
    });
  });

  describe('getting a user info with UserService', () => {
    const userId = '12345';

    let logger: jest.Mocked<TestLogger>;
    let apiService: jest.Mocked<ApiService>;
    let result: string;

    beforeAll(async () => {
      logger = unitRef.get(TestLogger) as StubbedInstance<TestLogger> as jest.Mocked<TestLogger>;
      apiService = unitRef.get(
        ApiService
      ) as StubbedInstance<ApiService> as jest.Mocked<ApiService>;

      apiService.fetchData.mockResolvedValue('Data from API');

      result = await userServiceAsIfItWasUnderTest.getUserInfo(userId);
    });

    it('should not call the logger as the ApiService is mocked and not exposed', () => {
      expect(logger.log).not.toHaveBeenCalledWith('fetching data');
    });

    it('should call the mocked ApiService to fetch the user data', () => {
      const endpointUrl = `https://api.example.com/users/${userId}`;
      expect(apiService.fetchData).toHaveBeenCalledWith(endpointUrl);
    });

    it('should go through UserApiService because it is exposed and return the data', () => {
      expect(result).toEqual('User Data: Data from API');
    });

    it('should not expose the HttpClient because it is not a direct dependency', () => {
      expect(() => unitRef.get(HttpClient)).toThrowError();
    });
  });

  it('should trigger the logger warning when the HttpClient is mocked', async () => {
    await unitBuilder.mock('non-existing-dep').using({}).compile();

    expect(loggerMock.warn).toHaveBeenCalledWith(
      expect.stringContaining('Suites Warning: Unreachable Mock Configuration Detected')
    );
  });

  it('should trigger the logger warning when the HttpClient is mocked', async () => {
    await unitBuilder.mock(UserDal).using({}).compile();

    expect(loggerMock.warn).toHaveBeenCalledWith(
      expect.stringContaining('Suites Warning: Unreachable Mock Configuration Detected')
    );
  });
});
