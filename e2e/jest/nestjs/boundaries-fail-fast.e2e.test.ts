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
  describe('Real use case - mock only I/O boundaries', () => {
    it('should allow simple configuration by specifying only what to mock', async () => {
      // The VALUE of boundaries: Just specify I/O to mock, everything else is real
      // Much simpler than listing dozens of .expose() calls
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([DatabaseService, ApiService]) // Just I/O
        .mock(Logger).impl((stub) => ({ log: stub(), info: stub() }))
        .compile();

      expect(unit).toBeInstanceOf(UserService);

      // Boundary mocks are retrievable when explicitly mocked
      const mockLogger = unitRef.get(Logger);
      expect(mockLogger.log).toBeDefined();

      // Repository token is auto-mocked
      const mockRepo = unitRef.get<Repository>('Repository');
      mockRepo.create = jest.fn().mockResolvedValue(undefined);

      // UserVerificationService is REAL (not a boundary)
      // It actually validates with real logic
      const validUser = { name: 'John', email: 'john@example.com' };
      await unit.create(validUser);

      expect(mockRepo.create).toHaveBeenCalled();
    });
  });

  describe('Comparison with expose pattern', () => {
    it('should require explicit configuration with expose (old way)', async () => {
      // The old tedious way - listing everything
      const { unit } = await TestBed.sociable(UserService)
        .disableFailFast() // For simplicity in this demo
        .expose(UserApiService)
        .expose(UserDal)
        .expose(UserVerificationService)
        // Would need many more in a real app
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });

    it('should be simple with boundaries (new way)', async () => {
      // The new simple way - just specify boundaries
      const { unit } = await TestBed.sociable(UserService)
        .boundaries([DatabaseService, ApiService])
        .mock(Logger).impl((stub) => ({ log: stub(), info: stub() }))
        .compile();

      expect(unit).toBeInstanceOf(UserService);
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