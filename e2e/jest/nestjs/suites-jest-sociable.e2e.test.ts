import type { UnitReference, Mocked } from '@suites/unit';
import { TestBed } from '@suites/unit';
import type { Repository, User } from './e2e-assets-sociable';
import {
  Logger,
  DatabaseService,
  UserApiService,
  UserDal,
  UserService,
  ApiService,
  UserVerificationService,
} from './e2e-assets-sociable';

describe('Suites Jest / NestJS E2E Test Ctor', () => {
  let underTest: UserService;
  let unitRef: UnitReference;

  beforeAll(async () => {
    const { unitRef: ref, unit } = await TestBed.sociable(UserService)
      .expose(UserApiService)
      .expose(UserDal)
      .expose(DatabaseService)
      .mock(Logger)
      .impl((stubFn) => ({ log: stubFn().mockReturnValue('overridden') }))
      .compile();

    // For type checking only, no runtime effect
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockedLogger: Mocked<Logger> = ref.get(Logger);

    unitRef = ref;
    underTest = unit;
  });

  describe('when compiling the builder and turning into testing unit', () => {
    it('should instantiate UserService with all dependencies properly resolved', () => {
      expect(underTest).toBeInstanceOf(UserService);
    });

    it('should log messages using the overridden Logger.log method when UserService is initialized', () => {
      const mockedLogger: Mocked<Logger> = unitRef.get(Logger);

      expect(mockedLogger.log).toHaveBeenNthCalledWith(1, 'Just logging a message');
      expect(mockedLogger.log).toHaveBeenNthCalledWith(2, 'UserService initialized');
    });

    it('should throw an error indicating the dependencies cannot be retrieved as they were exposed in the testbed', () => {
      expect(() => unitRef.get(DatabaseService)).toThrowError();
      expect(() => unitRef.get(UserDal)).toThrowError();
      expect(() => unitRef.get(UserApiService)).toThrowError();
    });

    describe('creating a user with UserService', () => {
      let repository: Mocked<Repository>;
      let userVerService: Mocked<UserVerificationService>;
      let createdUser: User;

      const userFixture = { name: 'Test User', email: 'test@example.com' } as const;

      beforeAll(async () => {
        repository = unitRef.get<Repository>('Repository');
        userVerService = unitRef.get(UserVerificationService);

        userVerService.verify.mockReturnValue(true);
        createdUser = await underTest.create(userFixture);
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

      let logger: Mocked<Logger>;
      let apiService: Mocked<ApiService>;
      let result: string;

      beforeAll(async () => {
        logger = unitRef.get(Logger);
        apiService = unitRef.get(ApiService);

        apiService.fetchData.mockResolvedValue('Data from API');

        result = await underTest.getUserInfo(userId);
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
});
