import { StubbedInstance } from '@suites/types.doubles';
import { FakeAdapter } from './assets/integration.assets';
import { mock } from './assets/mock.static';
import {
  Logger,
  Repository,
  UserApiService,
  UserDal,
  UserService,
  UserVerificationService,
  ApiService,
  DatabaseService,
  User,
} from './assets/injectable-registry.fixture';
import { SociableTestBedBuilder, UnitMocker, UnitReference } from '../../src';
import * as console from 'console';

describe('Social TestBed Builder Integration Tests', () => {
  let unitBuilder: SociableTestBedBuilder<UserService>;
  let userServiceAsIfItWasUnderTest: UserService;
  let unitRef: UnitReference;

  beforeAll(async () => {
    unitBuilder = new SociableTestBedBuilder(
      Promise.resolve(mock),
      Promise.resolve(FakeAdapter),
      new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
      UserService,
      console
    );

    const testBed = await unitBuilder
      .expose(UserApiService)
      .expose(UserDal)
      .expose(DatabaseService)
      .mock(Logger)
      .using({ log: jest.fn().mockReturnValue('overridden') })
      .compile();

    userServiceAsIfItWasUnderTest = testBed.unit;
    unitRef = testBed.unitRef;
  });

  it('should instantiate UserService with all dependencies properly resolved', () => {
    expect(userServiceAsIfItWasUnderTest).toBeInstanceOf(UserService);
  });

  it('should log messages using the overridden Logger.log method when UserService is initialized', () => {
    const mockedLogger: StubbedInstance<Logger> = unitRef.get<Logger>(Logger);

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

    let logger: jest.Mocked<Logger>;
    let apiService: jest.Mocked<ApiService>;
    let result: string;

    beforeAll(async () => {
      logger = unitRef.get(Logger) as unknown as jest.Mocked<Logger>;
      apiService = unitRef.get(ApiService) as unknown as jest.Mocked<ApiService>;

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
  });
});
