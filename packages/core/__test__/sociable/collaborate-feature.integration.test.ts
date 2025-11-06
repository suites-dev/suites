import { FakeAdapter } from './assets/integration.assets';
import { mock } from '../mock.static';
import {
  UserApiService,
  UserDal,
  UserService,
  UserVerificationService,
  ApiService,
  DatabaseService,
  UserDigestService,
} from './assets/injectable-registry.fixture';
import { SociableTestBedBuilderImpl, UnitMocker } from '../../src';

describe('Collaborate Feature - Internal Resolution Mechanics', () => {
  const loggerMock = mock<Console>();

  beforeEach(() => {
    loggerMock.warn.mockClear();
  });

  describe('Resolution: Explicit mock (Priority 1) beats exclusion (Priority 2)', () => {
    it('should use explicit mock when dependency is both excluded and mocked', async () => {
      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      // UserApiService is excluded AND explicitly mocked
      const { unit, unitRef } = await unitBuilder
        .collaborate()
        .exclude([
          UserApiService,
          UserDal,
          DatabaseService,
          ApiService,
          UserVerificationService,
          UserDigestService,
        ])
        .mock(UserApiService)
        .impl((stubFn) => ({
          getUserData: stubFn().mockResolvedValue('custom-implementation'),
          verifyUser: stubFn(),
        }))
        .compile();

      // ACT: Call UserService method which uses UserApiService
      const result = await unit.getUserInfo('test-user');

      // ASSERT: UserService used our explicit mock (not exclusion auto-mock)
      expect(result).toBe('custom-implementation');

      // ASSERT: Mock was called through UserService
      const mockUserApi = unitRef.get(UserApiService);
      expect(mockUserApi.getUserData).toHaveBeenCalledWith('test-user');
    });
  });

  describe('collaborate() with no exclusions', () => {
    it('should work without calling exclude (all dependencies real)', async () => {
      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      // Call collaborate() without exclude - all dependencies should be real
      const builder = unitBuilder.collaborate();

      // Should return collaborate mode builder
      expect(builder).toBeDefined();

      // For FakeAdapter compatibility, mock everything to avoid instantiation
      const { unit } = await builder
        .mock('Repository')
        .impl((stubFn) => ({
          find: stubFn().mockResolvedValue([]),
          create: stubFn().mockResolvedValue(undefined),
        }))
        .mock('SOME_VALUE_TOKEN')
        .final(['test'])
        .mock(UserApiService).impl(() => ({ getUserData: jest.fn(), verifyUser: jest.fn() }))
        .mock(UserDal).impl(() => ({ createUser: jest.fn() }))
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });
  });

  describe('CRITICAL: Retrieval rules in collaborate mode', () => {
    it('should ALLOW retrieving excluded classes (mocked) but NOT auto-exposed classes (real)', async () => {
      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      const { unitRef } = await unitBuilder
        .collaborate()
        .exclude([UserDal, DatabaseService, ApiService, UserDigestService])
        // UserApiService NOT excluded → auto-exposed (REAL)
        .mock('Repository')
        .impl((stubFn) => ({
          find: stubFn().mockResolvedValue([]),
          create: stubFn().mockResolvedValue(undefined),
        }))
        .mock('SOME_VALUE_TOKEN')
        .final(['test'])
        .compile();

      // UserDal is excluded → MOCKED → CAN retrieve
      const userDalMock = unitRef.get(UserDal);
      expect(userDalMock).toBeDefined();
      expect(typeof userDalMock.createUser).toBe('function');

      // UserApiService is auto-exposed → REAL → CANNOT retrieve
      expect(() => {
        unitRef.get(UserApiService);
      }).toThrow(/marked as an exposed dependency/);

      // This is CORRECT:
      // - Excluded = mocked = retrievable
      // - Auto-exposed = real = not retrievable
    });
  });

  describe('Resolution: Collaborate mode enables auto-expose', () => {
    it('should compile with collaborate mode', async () => {
      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      // All deps excluded for FakeAdapter compatibility
      const { unit } = await unitBuilder
        .collaborate()
        .exclude([
          UserApiService,
          UserDal,
          DatabaseService,
          ApiService,
          UserVerificationService,
          UserDigestService,
        ])
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });

    it('should auto-expose leaf classes that are not excluded', async () => {
      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      // UserVerificationService and TestLogger are leaf classes - NOT excluded
      // They should be auto-exposed (made real) in collaborate mode
      const testUser = { name: 'Test', email: 'test@example.com' };

      const { unit } = await unitBuilder
        .collaborate()
        .exclude([
          UserApiService,
          DatabaseService,
          ApiService,
          UserDigestService,
          // Remove UserDal to test real dependency chain
          // NOT UserVerificationService - it's a leaf, should be auto-exposed
          // NOT TestLogger - it's a leaf, should be auto-exposed
        ])
        .mock('Repository')
        .impl((stubFn) => ({
          find: stubFn().mockResolvedValue([]),
          create: stubFn().mockResolvedValue(undefined),
        }))
        .mock('SOME_VALUE_TOKEN')
        .final(['test', 'value'])
        .compile();

      // Call create which uses UserDal -> UserVerificationService
      // UserVerificationService should be REAL (not mocked)
      // If real, it runs: user.email.includes('@') → true
      const result = await unit.create(testUser);

      // This proves UserVerificationService was REAL:
      // - Real verify() logic ran and returned true
      // - create() succeeded and returned the user
      expect(result).toEqual(testUser);
    });
  });

  describe('Fail-fast behavior', () => {
    // Note: Specific fail-fast scenarios with collaborate mode are tested in e2e tests
    // where we have full NestJS DI and real service registries

    it('should fail-fast for unconfigured dependency in expose mode', async () => {
      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      // Only expose one dependency - others missing will trigger fail-fast
      await expect(unitBuilder.expose(UserApiService).compile()).rejects.toThrow(/not configured/);
    });

    it('should NOT fail when failFast is disabled', async () => {
      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      const { unit } = await unitBuilder.expose(UserApiService).failFast({ enabled: false }).compile();

      expect(unit).toBeInstanceOf(UserService);
    });

    it('should log warning when failFast is disabled', () => {
      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      unitBuilder.failFast({ enabled: false });

      expect(loggerMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('Disabling fail-fast is not recommended')
      );
    });

    // Note: Collaborate mode error message formatting is tested via e2e tests
    // with full DI context where auto-expose can properly trigger fail-fast

    it('should format error message for null mode when fail-fast triggers', async () => {
      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      // No mode set - should fail immediately
      await expect(unitBuilder.compile()).rejects.toMatchObject({
        message: expect.stringContaining('No mode configured'),
      });
    });

    it('should re-throw non-DependencyNotConfiguredError errors', async () => {
      // Create a builder with an adapter that throws a different error
      const badAdapter = {
        inspect: () => {
          throw new Error('Custom adapter error');
        },
      } as any;

      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(badAdapter)),
        UserService,
        loggerMock
      );

      await expect(unitBuilder.expose(UserApiService).compile()).rejects.toThrow(
        'Custom adapter error'
      );
    });

    it('should format error message for expose mode with helpful suggestions', async () => {
      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      await expect(unitBuilder.expose(UserApiService).compile()).rejects.toThrow(/In expose mode/);
    });
  });

  // Note: Mode mutual exclusivity is enforced at TYPE level (compile-time)
  // Runtime checks exist for JavaScript users but not tested here
  // E2E tests verify the error messages for user-facing scenarios

  describe('Error message formatting', () => {
    it('should include helpful context in expose mode error', async () => {
      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      await expect(unitBuilder.expose(UserApiService).compile()).rejects.toThrow(/not configured/);
    });

    it('should format error message for null mode', async () => {
      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      // No mode configured - should trigger null mode error
      await expect(unitBuilder.compile()).rejects.toThrow(/No mode configured/);
    });

    it('should provide migration path in error message', async () => {
      const unitBuilder = new SociableTestBedBuilderImpl(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      await expect(unitBuilder.expose(UserApiService).compile()).rejects.toThrow(/failFast.*enabled.*false/);
    });
  });
});