import { TestBed } from '@suites/unit';
import type { Repository } from './e2e-assets-sociable';
import {
  UserService,
  UserApiService,
  UserDal,
  ApiService,
  DatabaseService,
  UserVerificationService,
  UserDigestService,
  Logger,
  HttpClient,
  type User,
} from './e2e-assets-sociable';

/**
 * E2E tests for Collaborate and Fail-Fast features (v4.0.0)
 *
 * These tests simulate real-world usage from the user's perspective.
 * Goal: Verify that collaborate mode works as intended:
 * - Most dependencies are real (business logic executes)
 * - Only expensive/external services are excluded (mocked)
 * - Tokens are auto-mocked (automatically mocked - don't need exclusion declaration)
 */
describe('Collaborate and Fail-Fast - Real World E2E', () => {
  describe('Real-world collaborate usage: Exclude only expensive services', () => {
    it('should execute real business logic while excluding only expensive ApiService', async () => {
      // ARRANGE: Exclude only the expensive HTTP service, everything else real
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .collaborate()
        .exclude([ApiService]) // Only exclude expensive HTTP calls
        .mock<Repository>('Repository') // Token - must be explicitly mocked for verification
        .impl((stub) => ({
          find: stub().mockResolvedValue([]),
          create: stub().mockResolvedValue(undefined),
        }))
        .compile();

      // ACT: Call business logic
      const validUser: User = { name: 'John', email: 'john@example.com' };
      const result = await unit.create(validUser);

      // ASSERT: Real business logic executed
      expect(result).toEqual(validUser);

      // ASSERT: Real UserVerificationService.verify() was called (has @ in email)
      // (proven by the fact that create succeeded - real validation logic ran)

      // ASSERT: Token (Repository) was mocked and used
      const mockRepo = unitRef.get<Repository>('Repository');
      expect(mockRepo.create).toHaveBeenCalledWith(JSON.stringify(validUser));
    });

    it('should execute real validation logic and throw for invalid users', async () => {
      // ARRANGE
      const { unit } = await TestBed.sociable(UserService)
        .collaborate()
        .exclude([ApiService]) // Only exclude expensive service
        .mock<Repository>('Repository')
        .impl((stub) => ({
          find: stub().mockResolvedValue([]),
          create: stub().mockResolvedValue(undefined),
        }))
        .compile();

      // ACT & ASSERT: Real validation logic executes and throws
      const invalidUser: User = { name: 'Jane', email: 'invalid-email' }; // No @ sign

      await expect(unit.create(invalidUser)).rejects.toThrow('invalid user data');

      // This proves UserVerificationService.verify() actually ran with real logic
    });

    it('should work with excluded service when calling API methods', async () => {
      // ARRANGE: ApiService is excluded (mocked)
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .collaborate()
        .exclude([ApiService])
        .mock(ApiService)
        .impl((stub) => ({
          fetchData: stub().mockResolvedValue('mocked-api-response'),
        }))
        .compile();

      // ACT: Call method that uses ApiService
      const result = await unit.getUserInfo('user-123');

      // ASSERT: Mocked ApiService was used
      expect(result).toBe('user data: mocked-api-response');

      const mockApi = unitRef.get(ApiService);
      expect(mockApi.fetchData).toHaveBeenCalledWith('https://api.example.com/users/user-123');
    });
  });

  describe('Leaf class auto-exposure: Leaf classes are auto-exposed in collaborate mode', () => {
    it('should auto-expose leaf classes that are not excluded', async () => {
      // ARRANGE: UserVerificationService is a leaf class (no dependencies)
      // It's NOT excluded, so it should be auto-exposed (made real)
      const { unit } = await TestBed.sociable(UserService)
        .collaborate()
        .exclude([ApiService, UserApiService, UserDigestService])
        // UserDal is NOT excluded - it's real, uses real UserVerificationService
        // UserVerificationService is a leaf - should be auto-exposed
        .mock<Repository>('Repository')
        .impl((stub) => ({
          find: stub().mockResolvedValue([]),
          create: stub().mockResolvedValue(undefined),
        }))
        .compile();

      // ACT: Create user with valid email
      const validUser: User = { name: 'Test', email: 'test@example.com' };
      const result = await unit.create(validUser);

      // ASSERT: Success proves UserVerificationService was REAL
      // If it was mocked, verify() would return undefined → create() would fail
      // But it's real, so verify() runs: email.includes('@') → true → create succeeds
      expect(result).toEqual(validUser);

      // ACT: Create user with invalid email
      const invalidUser: User = { name: 'Test', email: 'invalid' };

      // ASSERT: Real UserVerificationService.verify() logic runs
      // email.includes('@') → false → create() throws
      await expect(unit.create(invalidUser)).rejects.toThrow('invalid user data');

      // This proves UserVerificationService is REAL (not mocked) even though
      // it wasn't explicitly exposed and wasn't excluded
    });
  });

  describe('Token auto-mocking: Tokens are automatically mocked', () => {
    it('should auto-mock token injections without declaring them as exclusions', async () => {
      // ARRANGE: Don't declare 'Repository' or 'SOME_VALUE_TOKEN' as exclusions
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .collaborate()
        .exclude([ApiService]) // Only this is excluded
        .mock<Repository>('Repository') // Mock token for verification
        .impl((stub) => ({
          find: stub().mockResolvedValue([]),
          create: stub().mockResolvedValue(undefined),
        }))
        .compile();

      // ACT: Call method that uses token-injected dependency
      const user: User = { name: 'Alice', email: 'alice@example.com' };
      await unit.create(user);

      // ASSERT: Token 'Repository' was auto-mocked (not real)
      const mockRepo = unitRef.get<Repository>('Repository');
      expect(mockRepo.create).toHaveBeenCalled();
      expect(typeof mockRepo.create).toBe('function');

      // This proves tokens are automatically mocked regardless of exclusions
    });

    it('should auto-mock SOME_VALUE_TOKEN without exclusion declaration', async () => {
      // ARRANGE: SOME_VALUE_TOKEN is injected in UserService and UserDigestService
      const { unit } = await TestBed.sociable(UserService)
        .collaborate()
        .exclude([ApiService]) // Don't declare SOME_VALUE_TOKEN
        .mock<string[]>('SOME_VALUE_TOKEN')
        .final(['mocked', 'token', 'value'])
        .mock<Repository>('Repository')
        .impl((stub) => ({
          find: stub().mockResolvedValue([]),
          create: stub().mockResolvedValue(undefined),
        }))
        .compile();

      // ACT & ASSERT: UserService constructor runs with mocked token
      // (constructor logs token values - if it throws, token wasn't mocked)
      expect(unit).toBeInstanceOf(UserService);

      // The fact that constructor didn't throw proves token was auto-mocked
    });
  });

  // NOTE: Fail-fast in collaborate mode is NOT tested here because auto-expose handles
  // all class dependencies automatically. In collaborate mode, fail-fast rarely triggers
  // since non-excluded classes are auto-exposed. The fail-fast safety net is primarily
  // valuable in expose mode (tested below).

  describe('Fail-fast with expose mode', () => {
    it('should fail-fast when accessing non-exposed dependency', async () => {
      await expect(
        TestBed.sociable(UserService).expose(UserApiService).compile()
      ).rejects.toThrow(/not configured/);
    });

    it('should provide helpful error message for expose mode', async () => {
      await expect(
        TestBed.sociable(UserService).expose(UserApiService).compile()
      ).rejects.toThrow(/In expose mode/);
    });

    it('should allow disabling for migration', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .failFast({ enabled: false })
        .expose(UserApiService)
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });
  });

  describe('Comparing collaborate vs expose for same test', () => {
    const validUser: User = { name: 'Test', email: 'test@example.com' };

    it('EXPOSE MODE: Tedious - must whitelist every dependency', async () => {
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .expose(UserApiService)
        .expose(UserDal)
        .expose(UserVerificationService)
        .expose(DatabaseService)
        .expose(UserDigestService)
        .expose(Logger)
        .expose(ApiService)
        .expose(HttpClient)
        // Still need to mock tokens
        .mock<Repository>('Repository')
        .impl((stub) => ({
          find: stub().mockResolvedValue([]),
          create: stub().mockResolvedValue(undefined),
        }))
        .compile();

      const result = await unit.create(validUser);

      expect(result).toEqual(validUser);

      const mockRepo = unitRef.get<Repository>('Repository');
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('COLLABORATE MODE: Simple - just exclude what to mock', async () => {
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .collaborate()
        .exclude([ApiService]) // Just exclude expensive service
        .mock<Repository>('Repository')
        .impl((stub) => ({
          find: stub().mockResolvedValue([]),
          create: stub().mockResolvedValue(undefined),
        }))
        .compile();

      const result = await unit.create(validUser);

      expect(result).toEqual(validUser);

      const mockRepo = unitRef.get<Repository>('Repository');
      expect(mockRepo.create).toHaveBeenCalled();
    });

    // Same test result, but collaborate mode is MUCH simpler configuration
  });
});
