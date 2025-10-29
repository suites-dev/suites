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
  describe('Boundaries simplifies test configuration', () => {
    it('should work with all class dependencies as boundaries', async () => {
      // When all class deps are boundaries, it's similar to mocking everything
      // But demonstrates boundaries API works correctly
      const { unit } = await TestBed.sociable(UserService)
        .boundaries([
          DatabaseService,
          ApiService,
          UserApiService,
          UserDal,
          UserVerificationService,
        ])
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });

    it('should demonstrate the value vs expose pattern', async () => {
      // OLD WAY with expose - must list everything to make real
      const { unit: unit1 } = await TestBed.sociable(UserService)
        .disableFailFast()
        .expose(UserApiService)
        .expose(UserDal)
        .expose(UserVerificationService)
        // Imagine 20+ more expose calls in a real app
        .compile();

      expect(unit1).toBeInstanceOf(UserService);

      // NEW WAY with boundaries - just list what to mock
      const { unit: unit2 } = await TestBed.sociable(UserService)
        .boundaries([DatabaseService, ApiService])
        // Everything else auto-exposed (but will fail-fast if missing deps)
        .mock(UserVerificationService).impl(() => ({ verify: jest.fn().mockReturnValue(true) }))
        .compile();

      expect(unit2).toBeInstanceOf(UserService);
    });
  });

  describe('Tokens are natural boundaries', () => {
    it('should auto-mock token injections without declaring them', async () => {
      const { unitRef } = await TestBed.sociable(UserService)
        .boundaries([
          DatabaseService,
          ApiService,
          UserApiService,
          UserDal,
          UserVerificationService,
        ])
        .compile();

      // Logger is a token - auto-mocked without being in boundaries array
      const mockLogger = unitRef.get(Logger);
      expect(mockLogger).toBeDefined();

      // Repository is also a token - auto-mocked
      const mockRepo = unitRef.get<Repository>('Repository');
      expect(mockRepo).toBeDefined();

      // This proves: Boundaries is NOT for I/O - tokens handle that!
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