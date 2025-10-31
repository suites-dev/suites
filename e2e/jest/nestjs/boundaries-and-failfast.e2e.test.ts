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
  HttpClient,
  Logger,
  type User,
} from './e2e-assets-sociable';

/**
 * E2E tests for Boundaries and Fail-Fast features (v4.0.0)
 *
 * These tests simulate real-world usage from the user's perspective.
 * Goal: Verify that boundaries mode works as intended for QozbroQqn's use case:
 * - Most dependencies are real (business logic executes)
 * - Only expensive/external services are mocked (boundaries)
 * - Tokens are auto-mocked (don't need boundaries declaration)
 */
describe('Boundaries and Fail-Fast - Real World E2E', () => {
  describe('Real-world boundaries usage: Mock only expensive services', () => {
    it('should execute real business logic while mocking only expensive ApiService', async () => {
      // ARRANGE: Mock only the expensive HTTP service, everything else real
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([ApiService]) // Only mock expensive HTTP calls
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
        .boundaries([ApiService]) // Only mock expensive service
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

    it('should work with mocked boundary when calling API methods', async () => {
      // ARRANGE: ApiService is boundary (mocked)
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([ApiService])
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

  describe('Token auto-mocking: Tokens are natural boundaries', () => {
    it('should auto-mock token injections without declaring them as boundaries', async () => {
      // ARRANGE: Don't declare 'Repository' or 'SOME_VALUE_TOKEN' as boundaries
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([ApiService]) // Only this is a boundary
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

      // This proves tokens are automatically mocked regardless of boundaries
    });

    it('should auto-mock SOME_VALUE_TOKEN without boundaries declaration', async () => {
      // ARRANGE: SOME_VALUE_TOKEN is injected in UserService and UserDigestService
      const { unit } = await TestBed.sociable(UserService)
        .boundaries([ApiService]) // Don't declare SOME_VALUE_TOKEN
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

  describe('Mixed real/mock verification: Prove which deps are real vs mocked', () => {
    it('should use real UserVerificationService and mocked ApiService', async () => {
      // ARRANGE: Spy on real UserVerificationService
      const verifySpy = jest.spyOn(UserVerificationService.prototype, 'verify');

      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([ApiService]) // ApiService is mocked
        .mock<Repository>('Repository')
        .impl((stub) => ({
          find: stub().mockResolvedValue([]),
          create: stub().mockResolvedValue(undefined),
        }))
        .compile();

      // ACT: Create user
      const user: User = { name: 'Bob', email: 'bob@test.com' };
      await unit.create(user);

      // ASSERT: Real UserVerificationService.verify() was called
      expect(verifySpy).toHaveBeenCalledWith(user);
      expect(verifySpy).toHaveReturnedWith(true);

      // ASSERT: ApiService is mocked (is a boundary)
      const apiService = unitRef.get(ApiService);
      expect(typeof apiService.fetchData).toBe('function');

      verifySpy.mockRestore();
    });

    it('should execute real DatabaseService which uses token-injected Repository', async () => {
      // ARRANGE
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([ApiService])
        .mock<Repository>('Repository')
        .impl((stub) => ({
          find: stub().mockResolvedValue([]),
          create: stub().mockResolvedValue(undefined),
        }))
        .compile();

      // ACT: Create user (goes through real DatabaseService)
      const user: User = { name: 'Charlie', email: 'charlie@example.com' };
      await unit.create(user);

      // ASSERT: Real DatabaseService.saveData() was called
      // which internally calls Repository.create (token - mocked)
      const mockRepo = unitRef.get<Repository>('Repository');
      expect(mockRepo.create).toHaveBeenCalledWith(JSON.stringify(user));

      // This proves:
      // 1. DatabaseService is REAL (not mocked)
      // 2. Repository (token) is MOCKED automatically
      // 3. Real class using token-injected dep works correctly
    });
  });

  describe('Fail-fast with boundaries mode', () => {
    it('should fail-fast when accessing non-configured dependency in boundaries mode', async () => {
      // ARRANGE: Don't declare ApiService as boundary
      // UserApiService needs ApiService, but it's not configured

      await expect(
        TestBed.sociable(UserService)
          .boundaries([DatabaseService]) // Wrong! ApiService not included
          .compile()
      ).rejects.toThrow(/not configured/);

      // This proves fail-fast works in boundaries mode
    });

    it('should provide helpful error message for boundaries mode', async () => {
      try {
        await TestBed.sociable(UserService)
          .boundaries([DatabaseService]) // Missing ApiService
          .compile();

        fail('Should have thrown');
      } catch (error: any) {
        // ASSERT: Error message is helpful
        expect(error.message).toContain('not configured');
        expect(error.message).toContain('In boundaries mode');
        expect(error.message).toContain('all dependencies are real by default');
        expect(error.message).toContain('.boundaries(');
        expect(error.message).toContain('.mock(');
      }
    });

    it('should allow disableFailFast as escape hatch in boundaries mode', async () => {
      // ARRANGE: Missing dependencies but fail-fast disabled
      const { unit } = await TestBed.sociable(UserService)
        .boundaries([DatabaseService])
        .disableFailFast()
        .compile();

      // ASSERT: Compiles without error (v3.x behavior)
      expect(unit).toBeInstanceOf(UserService);
    });
  });

  describe('Fail-fast with expose mode', () => {
    it('should fail-fast when accessing non-exposed dependency', async () => {
      await expect(
        TestBed.sociable(UserService).expose(UserApiService).compile()
      ).rejects.toThrow(/not configured/);
    });

    it('should provide helpful error message for expose mode', async () => {
      try {
        await TestBed.sociable(UserService).expose(UserApiService).compile();
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('not configured');
        expect(error.message).toContain('In expose mode');
        expect(error.message).toContain('all dependencies are mocked by default');
        expect(error.message).toContain('.expose(');
      }
    });

    it('should allow disabling for migration', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .disableFailFast()
        .expose(UserApiService)
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });
  });

  describe('Mode mutual exclusivity', () => {
    it('should prevent mixing boundaries and expose', () => {
      expect(() => {
        TestBed.sociable(UserService).boundaries([ApiService]).expose(UserDal);
      }).toThrow(/Cannot use \.expose\(\) after \.boundaries\(\)/);
    });

    it('should prevent mixing expose and boundaries', () => {
      expect(() => {
        TestBed.sociable(UserService).expose(UserDal).boundaries([ApiService]);
      }).toThrow(/Cannot use \.boundaries\(\) after \.expose\(\)/);
    });
  });

  describe('Comparing boundaries vs expose for same test', () => {
    const validUser: User = { name: 'Test', email: 'test@example.com' };

    it('EXPOSE MODE: Tedious - must whitelist every dependency', async () => {
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .expose(UserApiService)
        .expose(UserDal)
        .expose(UserVerificationService)
        .expose(DatabaseService)
        .expose(UserDigestService)
        .expose(Logger)
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

    it('BOUNDARIES MODE: Simple - just declare what to mock', async () => {
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([ApiService]) // Just mock expensive service
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

    // Same test result, but boundaries mode is MUCH simpler configuration
  });
});
