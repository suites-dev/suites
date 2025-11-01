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
import { SociableTestBedBuilder, UnitMocker } from '../../src';

describe('Boundaries Feature - Internal Resolution Mechanics', () => {
  const loggerMock = mock<Console>();

  beforeEach(() => {
    loggerMock.warn.mockClear();
  });

  describe('Resolution: Explicit mock (Priority 1) beats boundary (Priority 2)', () => {
    it('should use explicit mock when dependency is both in boundaries and mocked', async () => {
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      // UserApiService is in boundaries AND explicitly mocked
      const { unit, unitRef } = await unitBuilder
        .boundaries([
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

      // ASSERT: UserService used our explicit mock (not boundary auto-mock)
      expect(result).toBe('custom-implementation');

      // ASSERT: Mock was called through UserService
      const mockUserApi = unitRef.get(UserApiService);
      expect(mockUserApi.getUserData).toHaveBeenCalledWith('test-user');
    });
  });

  describe('boundaries() no-arg overload', () => {
    it('should accept no arguments (same as empty array)', async () => {
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      // Call boundaries() without args - should work
      const builder = unitBuilder.boundaries();

      // Should return boundaries mode builder
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

  describe('CRITICAL: Retrieval rules in boundaries mode', () => {
    it('should ALLOW retrieving boundary classes (mocked) but NOT auto-exposed classes (real)', async () => {
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      const { unitRef } = await unitBuilder
        .boundaries([UserDal, DatabaseService, ApiService, UserDigestService])
        // UserApiService NOT in boundaries → auto-exposed (REAL)
        .mock('Repository')
        .impl((stubFn) => ({
          find: stubFn().mockResolvedValue([]),
          create: stubFn().mockResolvedValue(undefined),
        }))
        .mock('SOME_VALUE_TOKEN')
        .final(['test'])
        .compile();

      // UserDal is in boundaries → MOCKED → CAN retrieve
      const userDalMock = unitRef.get(UserDal);
      expect(userDalMock).toBeDefined();
      expect(typeof userDalMock.createUser).toBe('function');

      // UserApiService is auto-exposed → REAL → CANNOT retrieve
      expect(() => {
        unitRef.get(UserApiService);
      }).toThrow(/marked as an exposed dependency/);

      // This is CORRECT:
      // - Boundaries = mocked = retrievable
      // - Auto-exposed = real = not retrievable
    });
  });

  describe('Resolution: Boundaries mode enables auto-expose', () => {
    it('should compile with boundaries mode', async () => {
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      // All deps as boundaries for FakeAdapter compatibility
      const { unit } = await unitBuilder
        .boundaries([
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

    it('should auto-expose leaf classes that are not in boundaries', async () => {
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      // UserVerificationService and TestLogger are leaf classes - NOT in boundaries array
      // They should be auto-exposed (made real) in boundaries mode
      const testUser = { name: 'Test', email: 'test@example.com' };

      const { unit } = await unitBuilder
        .boundaries([
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
    // Note: Specific fail-fast scenarios with boundaries are tested in e2e tests
    // where we have full NestJS DI and real service registries

    it('should fail-fast for unconfigured dependency in expose mode', async () => {
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      // Only expose one dependency - others missing will trigger fail-fast
      await expect(unitBuilder.expose(UserApiService).compile()).rejects.toThrow(/not configured/);
    });

    it('should NOT fail when disableFailFast is used', async () => {
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      const { unit } = await unitBuilder.expose(UserApiService).disableFailFast().compile();

      expect(unit).toBeInstanceOf(UserService);
    });

    it('should log warning when disableFailFast is used', () => {
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      unitBuilder.disableFailFast();

      expect(loggerMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('.disableFailFast() is a migration helper')
      );
    });

    // Note: Boundaries mode error message formatting is tested via e2e tests
    // with full DI context where auto-expose can properly trigger fail-fast

    it('should format error message for null mode when fail-fast triggers', async () => {
      const unitBuilder = new SociableTestBedBuilder(
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

      const unitBuilder = new SociableTestBedBuilder(
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
      const unitBuilder = new SociableTestBedBuilder(
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
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      await expect(unitBuilder.expose(UserApiService).compile()).rejects.toThrow(/not configured/);
    });

    it('should provide migration path in error message', async () => {
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      await expect(unitBuilder.expose(UserApiService).compile()).rejects.toThrow(/disableFailFast/);
    });
  });
});