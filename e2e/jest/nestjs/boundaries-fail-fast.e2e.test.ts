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
  describe('Boundaries - mock specific class, rest is real', () => {
    let underTest: UserService;
    let unitRef: UnitReference;

    beforeAll(async () => {
      // Mock ONLY ApiService class as boundary
      // Everything else: either real (classes) or auto-mocked (tokens)
      const { unit, unitRef: ref } = await TestBed.sociable(UserService)
        .boundaries([ApiService]) // Just this one class!
        .compile();

      underTest = unit;
      unitRef = ref;
    });

    it('should instantiate with real business logic services', () => {
      expect(underTest).toBeInstanceOf(UserService);
    });

    it('should use REAL UserVerificationService for validation', async () => {
      // UserVerificationService is REAL (not a boundary)
      const mockRepo = unitRef.get<Repository>('Repository');
      mockRepo.create = jest.fn().mockResolvedValue(undefined);

      // Valid email - REAL UserVerificationService accepts it
      const validUser = { name: 'John', email: 'john@example.com' };
      const created = await underTest.create(validUser);
      expect(created).toEqual(validUser);

      // Invalid email - REAL UserVerificationService rejects it
      const invalidUser = { name: 'Jane', email: 'invalid' };
      await expect(underTest.create(invalidUser)).rejects.toThrow('Invalid user data');
    });

    it('should mock ApiService as specified in boundaries', async () => {
      // ApiService is a boundary - it's mocked
      const mockApi = unitRef.get(ApiService);
      expect(mockApi).toBeDefined();
      expect(mockApi.fetchData).toBeDefined();
    });

    it('should auto-mock tokens (Logger, Repository) without declaring them', () => {
      // These are tokens - auto-mocked regardless of boundaries
      const mockLogger = unitRef.get(Logger);
      const mockRepo = unitRef.get<Repository>('Repository');

      expect(mockLogger).toBeDefined();
      expect(mockRepo).toBeDefined();

      // Proves: Tokens are natural boundaries, don't need to declare!
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

  describe('Fail-fast prevents lying tests', () => {
    it('should throw when dependency not configured in expose mode', async () => {
      await expect(
        TestBed.sociable(UserService)
          .expose(UserApiService)
          // Missing: UserDal, DatabaseService, etc.
          .compile()
      ).rejects.toThrow(/not configured/);
    });

    it('should allow migration with disableFailFast', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .disableFailFast()
        .expose(UserApiService)
        // Other deps auto-mocked (v3.x behavior)
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });
  });
});