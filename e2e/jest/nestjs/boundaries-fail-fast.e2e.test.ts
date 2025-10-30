import type { UnitReference } from '@suites/unit';
import { TestBed } from '@suites/unit';
import type { Repository } from './e2e-assets-sociable';
import {
  Logger,
  DatabaseService,
  UserApiService,
  UserDal,
  UserService,
  ApiService,
  UserVerificationService,
} from './e2e-assets-sociable';

describe('Suites Boundaries Feature (v4.0.0)', () => {
  describe('Testing user creation with boundaries', () => {
    let underTest: UserService;
    let unitRef: UnitReference;

    beforeAll(async () => {
      // Configure boundaries and explicit mocks for dependencies we want to verify
      const { unit, unitRef: ref } = await TestBed.sociable(UserService)
        .boundaries([ApiService, DatabaseService, UserApiService, UserDal, UserVerificationService])
        .mock(UserVerificationService)
        .impl((stub) => ({
          verify: stub().mockReturnValue(true),
        }))
        .mock(Logger)
        .impl((stub) => ({
          log: stub(),
          info: stub(),
        }))
        .compile();

      underTest = unit;
      unitRef = ref;
    });

    it('should instantiate UserService', () => {
      expect(underTest).toBeInstanceOf(UserService);
    });

    it('should create user using mocked dependencies', async () => {
      // ARRANGE: Get mocked dependencies
      const mockVerification = unitRef.get(UserVerificationService);

      // ACT: Create a user
      const user = { name: 'John Doe', email: 'john@example.com' };
      const result = await underTest.create(user);

      // ASSERT: Verify the mock was called
      expect(result).toEqual(user);
      expect(mockVerification.verify).toHaveBeenCalledWith(user);
    });

    it('should verify Logger token was auto-mocked and called during construction', () => {
      // Logger is a token - we mocked it explicitly to verify calls
      const mockLogger = unitRef.get(Logger);

      expect(mockLogger.log).toHaveBeenCalledWith('just logging a message');
      expect(mockLogger.log).toHaveBeenCalledWith('UserService initialized');
    });
  });

  describe('Comparing configuration patterns', () => {
    it('EXPOSE: List what should be real (whitelist)', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .disableFailFast()
        .expose(UserApiService)
        .expose(UserDal)
        .expose(DatabaseService)
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });

    it('BOUNDARIES: List what should be mocked (blacklist)', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .boundaries([ApiService, DatabaseService, UserApiService, UserDal, UserVerificationService])
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });
  });

  describe('Fail-fast catches configuration bugs', () => {
    it('should throw when dependency not configured', async () => {
      await expect(
        TestBed.sociable(UserService).expose(UserApiService).compile()
      ).rejects.toThrow(/not configured/);
    });

    it('should allow disabling fail-fast for migration', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .disableFailFast()
        .expose(UserApiService)
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });
  });

  describe('Mode mutual exclusivity', () => {
    it('should prevent using expose after boundaries', () => {
      expect(() => {
        TestBed.sociable(UserService).boundaries([ApiService]).expose(UserDal);
      }).toThrow(/Cannot use \.expose\(\) after \.boundaries\(\)/);
    });

    it('should prevent using boundaries after expose', () => {
      expect(() => {
        TestBed.sociable(UserService).expose(UserDal).boundaries([ApiService]);
      }).toThrow(/Cannot use \.boundaries\(\) after \.expose\(\)/);
    });
  });
});