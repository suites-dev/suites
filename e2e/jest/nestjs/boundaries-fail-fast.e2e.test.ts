import type { UnitReference } from '@suites/unit';
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

describe('Suites Boundaries Feature (v4.0.0)', () => {
  describe('Basic boundaries functionality', () => {
    it('should allow simple configuration by specifying class boundaries', async () => {
      // The VALUE of boundaries: Just specify what to mock, everything else is real
      // Note: I/O tokens (Repository, Logger) are ALWAYS auto-mocked
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([DatabaseService, ApiService]) // Class boundaries
        .compile();

      expect(unit).toBeInstanceOf(UserService);

      // Tokens are auto-mocked (Repository, Logger)
      const mockRepo = unitRef.get<Repository>('Repository');
      const mockLogger = unitRef.get(Logger);
      expect(mockRepo).toBeDefined();
      expect(mockLogger).toBeDefined();

      // UserVerificationService, UserDal, UserApiService are REAL (auto-exposed)
      // Testing actual business logic, not mocks!
      mockRepo.create = jest.fn().mockResolvedValue(undefined);

      const validUser = { name: 'John', email: 'john@example.com' };
      await unit.create(validUser);

      // Real UserVerificationService validated the email
      // Real UserDal processed the creation
      expect(mockRepo.create).toHaveBeenCalled();
    });
  });

  describe('Why tokens are natural boundaries', () => {
    it('should auto-mock token injections without declaring them as boundaries', async () => {
      const { unitRef } = await TestBed.sociable(UserService)
        .boundaries([DatabaseService, ApiService])
        .compile();

      // These tokens are auto-mocked - didn't need to add to boundaries!
      const mockLogger = unitRef.get(Logger);
      const mockRepo = unitRef.get<Repository>('Repository');
      const mockToken = unitRef.get<string[]>('SOME_VALUE_TOKEN');

      expect(mockLogger).toBeDefined(); // @Inject('Logger')
      expect(mockRepo).toBeDefined(); // @Inject('Repository')
      expect(mockToken).toBeUndefined(); // Not explicitly configured

      // This is why boundaries is NOT for I/O - tokens handle that!
    });
  });

  describe('Fail-fast prevents lying tests', () => {
    it('should throw when dependency is not configured (catch bugs)', async () => {
      // This catches configuration mistakes
      await expect(
        TestBed.sociable(UserService)
          .expose(UserApiService) // Only expose one thing
          // Missing: UserDal, DatabaseService, ApiService, etc.
          .compile()
      ).rejects.toThrow(/not configured/);
    });

    it('should allow opting out with disableFailFast for migration', async () => {
      // Migration path: temporarily disable fail-fast
      const { unit } = await TestBed.sociable(UserService)
        .disableFailFast() // Opt-out
        .expose(UserApiService)
        // Other deps auto-mocked (v3.x behavior)
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });
  });

  describe('Mode mutual exclusivity', () => {
    it('should prevent mixing expose and boundaries', async () => {
      expect(() => {
        TestBed.sociable(UserService).boundaries([DatabaseService]).expose(UserApiService);
      }).toThrow(/Cannot use \.expose\(\) after \.boundaries\(\)/);
    });

    it('should prevent mixing boundaries and expose', async () => {
      expect(() => {
        TestBed.sociable(UserService).expose(UserApiService).boundaries([DatabaseService]);
      }).toThrow(/Cannot use \.boundaries\(\) after \.expose\(\)/);
    });
  });
});