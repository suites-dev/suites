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
  const loggerMock = { warn: jest.fn() } as unknown as jest.Mocked<Console>;

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
      const { unitRef } = await unitBuilder
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

      const mockUserApi = unitRef.get(UserApiService);

      // ASSERT: It's our explicit mock, not boundary auto-mock
      const result = await mockUserApi.getUserData('test');
      expect(result).toBe('custom-implementation');
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

      try {
        await unitBuilder.expose(UserApiService).compile();
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('In expose mode');
        expect(error.message).toContain('all dependencies are mocked by default');
        expect(error.message).toContain('.expose(');
        expect(error.message).toContain('.mock(');
        expect(error.message).toContain('.disableFailFast()');
      }
    });
  });

  describe('Mode enforcement', () => {
    it('should throw error when using expose after boundaries', () => {
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      unitBuilder.boundaries([ApiService]);

      // Runtime check still exists for JavaScript users
      expect(() => {
        unitBuilder.expose(UserDal);
      }).toThrow(/Cannot use \.expose\(\) after \.boundaries\(\)/);
    });

    it('should throw error when using boundaries after expose', () => {
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      unitBuilder.expose(UserDal);

      // Runtime check for JavaScript users
      expect(() => {
        unitBuilder.boundaries([ApiService]);
      }).toThrow(/Cannot use \.boundaries\(\) after \.expose\(\)/);
    });
  });

  describe('Error message formatting', () => {
    it('should include helpful context in expose mode error', async () => {
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      try {
        await unitBuilder.expose(UserApiService).compile();
      } catch (error: any) {
        // Error is for whichever dep is hit first (ApiService in this case)
        expect(error.message).toContain('not configured');
        expect(error.message).toContain('In expose mode');
        expect(error.message).toContain('all dependencies are mocked by default');
        expect(error.message).toContain('.expose(');
        expect(error.message).toContain('.mock(');
      }
    });

    it('should provide migration path in error message', async () => {
      const unitBuilder = new SociableTestBedBuilder(
        Promise.resolve({ mock, stub: jest.fn }),
        new UnitMocker(Promise.resolve(mock), Promise.resolve(FakeAdapter)),
        UserService,
        loggerMock
      );

      try {
        await unitBuilder.expose(UserApiService).compile();
      } catch (error: any) {
        expect(error.message).toContain('https://suites.dev/docs/v4-migration');
        expect(error.message).toContain('.disableFailFast()');
      }
    });
  });
});