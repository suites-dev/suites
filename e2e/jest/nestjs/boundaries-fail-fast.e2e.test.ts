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

describe('Suites Boundaries Feature (v4.0.0) - Real World Usage', () => {
  describe('Testing UserService.create() with boundaries pattern', () => {
    it('should create a valid user with real business logic and mocked I/O', async () => {
      // SCENARIO: Testing user creation with real validation but mocked database
      // Using boundaries to mock ApiService, everything else is REAL
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([ApiService]) // Mock only this class
        .mock<Repository>('Repository')
        .impl((stub) => ({
          create: stub().mockResolvedValue(undefined),
          find: stub().mockResolvedValue([]),
        }))
        .compile();

      const mockRepo = unitRef.get<Repository>('Repository');

      // ACT: Create a valid user
      const validUser = { name: 'John Doe', email: 'john@example.com' };
      const result = await unit.create(validUser);

      // ASSERT: Real UserVerificationService validated the email (has @)
      // Real UserDal processed the creation logic
      expect(result).toEqual(validUser);
      expect(mockRepo.create).toHaveBeenCalledWith(JSON.stringify(validUser));
    });

    it('should reject invalid user using REAL validation logic', async () => {
      // SCENARIO: Testing that real UserVerificationService catches bad data
      const { unit } = await TestBed.sociable(UserService)
        .boundaries([ApiService])
        .mock<Repository>('Repository')
        .impl((stub) => ({
          create: stub().mockResolvedValue(undefined),
          find: stub().mockResolvedValue([]),
        }))
        .compile();

      // ACT: Try to create invalid user (no @ in email)
      const invalidUser = { name: 'Jane', email: 'invalid-email' };

      // ASSERT: Real UserVerificationService.verify() returns false
      // Real UserDal.createUser() throws error
      await expect(unit.create(invalidUser)).rejects.toThrow('Invalid user data');
    });
  });

  describe('Testing UserService.getUserInfo() with different boundary configurations', () => {
    it('OLD WAY: Must expose each service explicitly', async () => {
      // SCENARIO: Traditional expose pattern - tedious configuration
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .disableFailFast() // For this demo
        .expose(UserApiService)
        .expose(UserDal)
        .expose(DatabaseService)
        .mock(ApiService)
        .impl((stub) => ({
          fetchData: stub().mockResolvedValue('API Response'),
        }))
        .compile();

      // ACT: Fetch user info
      const result = await unit.getUserInfo('user-123');

      // ASSERT: Goes through real UserApiService
      expect(result).toContain('API Response');
    });

    it('NEW WAY: Just specify ApiService boundary, rest auto-exposed', async () => {
      // SCENARIO: Boundaries pattern - simple configuration
      const { unit } = await TestBed.sociable(UserService)
        .boundaries([ApiService])
        .mock(ApiService)
        .impl((stub) => ({
          fetchData: stub().mockResolvedValue('Mocked API Data'),
        }))
        .mock<Repository>('Repository')
        .impl((stub) => ({ create: stub(), find: stub() }))
        .compile();

      // ACT: Fetch user info
      const result = await unit.getUserInfo('user-456');

      // ASSERT: Real UserApiService processed it, mocked ApiService returned data
      expect(result).toContain('Mocked API Data');
    });
  });

  describe('Tokens are natural boundaries - I/O is already isolated', () => {
    it('should auto-mock Repository token without declaring it as boundary', async () => {
      // SCENARIO: Testing that tokens don't need to be in boundaries array
      const { unitRef } = await TestBed.sociable(UserService)
        .boundaries([ApiService])
        .mock<Repository>('Repository')
        .impl((stub) => ({ create: stub(), find: stub() }))
        .compile();

      // ASSERT: Repository token is mocked (didn't declare it in boundaries!)
      const mockRepo = unitRef.get<Repository>('Repository');
      expect(mockRepo).toBeDefined();
      expect(mockRepo.create).toBeDefined();

      // Logger is also a token - auto-mocked
      const mockLogger = unitRef.get(Logger);
      expect(mockLogger).toBeDefined();

      // This is why boundaries is NOT for I/O - tokens handle that automatically!
    });
  });

  describe('Fail-fast prevents configuration mistakes', () => {
    it('should catch missing dependency configuration immediately', async () => {
      // SCENARIO: Developer forgets to configure a dependency
      await expect(
        TestBed.sociable(UserService)
          .expose(UserApiService)
          // BUG: Forgot to configure UserDal, DatabaseService, etc.
          .compile()
      ).rejects.toThrow(/not configured/);

      // Fail-fast caught the bug before the test ran!
    });

    it('should allow gradual migration with disableFailFast', async () => {
      // SCENARIO: Migrating from v3.x, temporarily disable fail-fast
      const { unit } = await TestBed.sociable(UserService)
        .disableFailFast() // Migration helper
        .expose(UserApiService)
        // Other deps auto-mocked (v3.x behavior)
        .compile();

      expect(unit).toBeInstanceOf(UserService);
      // Developer can gradually add proper configuration
    });
  });

  describe('Mode mutual exclusivity prevents confusion', () => {
    it('should prevent mixing expose and boundaries mental models', () => {
      // SCENARIO: Developer tries to mix modes - would be confusing
      expect(() => {
        TestBed.sociable(UserService)
          .boundaries([ApiService]) // "Everything real except this"
          .expose(UserDal); // "Make this real" - but it's already real!
      }).toThrow(/Cannot use \.expose\(\) after \.boundaries\(\)/);
    });
  });
});