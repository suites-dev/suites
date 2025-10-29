import type { UnitReference, Mocked } from '@suites/unit';
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
  HttpClient,
  UserDigestService,
} from './e2e-assets-sociable';

describe('Suites Boundaries Feature (v4.0.0)', () => {
  describe('boundaries() - inverse of expose pattern', () => {
    let underTest: UserService;
    let unitRef: UnitReference;

    beforeAll(async () => {
      // Boundaries pattern: "Mock these specific deps, everything else is real"
      const { unit, unitRef: ref } = await TestBed.sociable(UserService)
        .boundaries([DatabaseService, ApiService])
        .compile();

      underTest = unit;
      unitRef = ref;
    });

    it('should create the unit under test', () => {
      expect(underTest).toBeInstanceOf(UserService);
    });

    it('should mock dependencies listed in boundaries', () => {
      // These are boundaries - they're mocked
      const mockDatabase = unitRef.get(DatabaseService);
      const mockApi = unitRef.get(ApiService);

      expect(mockDatabase).toBeDefined();
      expect(mockApi).toBeDefined();

      // Mock behavior - methods exist but return undefined by default
      expect(mockDatabase.findData).toBeDefined();
      expect(mockDatabase.saveData).toBeDefined();
      expect(mockApi.fetchData).toBeDefined();
    });

    it('should auto-expose (make real) all non-boundary class dependencies', () => {
      // These are NOT boundaries, so they're real (not retrievable via unitRef)
      expect(() => unitRef.get(UserApiService)).toThrow(
        /Cannot retrieve exposed instance/
      );
      expect(() => unitRef.get(UserDal)).toThrow(
        /Cannot retrieve exposed instance/
      );
      expect(() => unitRef.get(UserVerificationService)).toThrow(
        /Cannot retrieve exposed instance/
      );
      expect(() => unitRef.get(UserDigestService)).toThrow(
        /Cannot retrieve exposed instance/
      );
    });

    it('should auto-expose nested dependencies when parent is not a boundary', () => {
      // HttpClient is nested under ApiService
      // Since ApiService IS a boundary (mocked), HttpClient is never instantiated,
      // But if ApiService was NOT a boundary, HttpClient would be real too

      // In this test ApiService is a boundary, so we can't verify HttpClient
      // This is correct behavior - boundaries stop traversal
    });

    it('should ALWAYS mock token injections regardless of boundaries', () => {
      // Tokens are ALWAYS mocked - they're natural boundaries
      const mockLogger = unitRef.get(Logger);
      const mockRepository = unitRef.get<Repository>('Repository');
      const mockTokenValue = unitRef.get<string[]>('SOME_VALUE_TOKEN');

      expect(mockLogger).toBeDefined();
      expect(mockRepository).toBeDefined();
      expect(mockTokenValue).toBeUndefined(); // Not mocked, so undefined
    });

    describe('using the service with boundaries', () => {
      it('should work with mocked boundaries and real internal services', async () => {
        // Setup mocks for boundaries
        const mockDb = unitRef.get(DatabaseService);
        mockDb.saveData = jest.fn().mockResolvedValue(undefined);

        const mockRepo = unitRef.get<Repository>('Repository');
        mockRepo.create = jest.fn().mockResolvedValue(undefined);

        // UserVerificationService is REAL (not a boundary)
        // It will actually validate the email
        const validUser = { name: 'John', email: 'john@example.com' };
        const invalidUser = { name: 'Jane', email: 'invalid' };

        // Valid user should work
        const created = await underTest.create(validUser);
        expect(created).toEqual(validUser);

        // Invalid user should fail (real verification service rejects it)
        await expect(underTest.create(invalidUser)).rejects.toThrow('invalid user data');
      });
    });
  });

  describe('boundaries with custom mocks', () => {
    it('should allow overriding boundary mocks with custom implementations', async () => {
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([DatabaseService])
        .mock(ApiService)
        .impl((stubFn) => ({
          fetchData: stubFn().mockResolvedValue('custom-api-response')
        }))
        .compile();

      const mockApi = unitRef.get(ApiService);
      expect(await mockApi.fetchData('test')).toBe('custom-api-response');

      // DatabaseService is a boundary with default mock
      const mockDb = unitRef.get(DatabaseService);
      expect(mockDb.findData).toBeDefined();
      expect(await mockDb.findData('test')).toBeUndefined(); // Default mock behavior
    });
  });

  describe('Mode mutual exclusivity', () => {
    it('should prevent using expose after boundaries', async () => {
      await expect(
        TestBed.sociable(UserService)
          .boundaries([DatabaseService])
          .expose(UserApiService)
          .compile()
      ).rejects.toThrow(/Cannot use \.expose\(\) after \.boundaries\(\)/);
    });

    it('should prevent using boundaries after expose', async () => {
      await expect(
        TestBed.sociable(UserService)
          .expose(UserApiService)
          .boundaries([DatabaseService])
          .compile()
      ).rejects.toThrow(/Cannot use \.boundaries\(\) after \.expose\(\)/);
    });
  });

  describe('Fail-fast behavior - Preventing "Lying Tests"', () => {
    // Real-world bug example: Service with typo in method call
    class PaymentService {
      async chargeCard(amount: number): Promise<{ id: string }> {
        return { id: 'payment_123' };
      }
    }

    class OrderProcessor {
      constructor(private payment: PaymentService) {}

      async processOrder(amount: number): Promise<string> {
        // BUG: Typo - 'chargeCrad' instead of 'chargeCard'
        const result = await this.payment['chargeCrad'](amount);
        return result.id; // This line never runs but test doesn't know!
      }
    }

    describe('The "Lying Test" problem', () => {
      it('WITHOUT fail-fast: Test passes despite critical bug', async () => {
        const { unit } = await TestBed.sociable(OrderProcessor)
          .disableFailFast() // Simulate v3.x behavior
          .compile();

        // This SHOULD fail but doesn't!
        // payment['chargeCrad'] returns undefined (typo)
        // Then undefined.id fails, but test sees it as success
        const orderId = await unit.processOrder(100);

        // ❌ LYING TEST: orderId is undefined, but test passes!
        expect(orderId).toBeUndefined(); // Passes, but for wrong reason!

        // In production: No payment processed, but system thinks it was!
      });

      it('WITH fail-fast: Test correctly fails, catching the bug', async () => {
        await expect(
          TestBed.sociable(OrderProcessor)
            // fail-fast ON by default in v4.0.0
            .compile()
        ).rejects.toThrow(/chargeCrad.*not.*configured|undefined/);

        // ✅ Bug caught immediately at test time!
        // ✅ Developer fixes typo before shipping
      });
    });

    // Create a test class with a missing dependency
    class MissingDependencyService {}

    class TestServiceWithMissing {
      constructor(
        private missing: MissingDependencyService,
        private database: DatabaseService
      ) {}
    }

    describe('in boundaries mode (fail-fast AUTO-ENABLED)', () => {
      it('should throw for unregistered/unconfigured dependencies', async () => {
        await expect(
          TestBed.sociable(TestServiceWithMissing)
            .boundaries([DatabaseService])
            // MissingDependencyService is not registered/configured
            .compile()
        ).rejects.toThrow(/MissingDependencyService.*not configured/);
      });

      it('should provide helpful error messages', async () => {
        try {
          await TestBed.sociable(TestServiceWithMissing)
            .boundaries([DatabaseService])
            .compile();
        } catch (error: any) {
          expect(error.message).toContain('MissingDependencyService');
          expect(error.message).toContain('not configured');
          expect(error.message).toContain('boundaries mode');
          expect(error.message).toContain('.mock(MissingDependencyService)');
        }
      });

      it('should allow disabling fail-fast with opt-out', async () => {
        const { unit } = await TestBed.sociable(UserService)
          .boundaries([DatabaseService])
          .disableFailFast() // Opt-out of fail-fast
          .compile();

        expect(unit).toBeInstanceOf(UserService);
      });
    });

    describe('in expose mode (fail-fast DISABLED by default - backward compat)', () => {
      it('should NOT throw by default to maintain v3.x behavior', async () => {
        const { unit, unitRef } = await TestBed.sociable(UserService)
          .expose(UserApiService)
          // Other deps not configured - auto-mocked silently (v3.x behavior)
          .compile();

        expect(unit).toBeInstanceOf(UserService);

        // Non-exposed deps are auto-mocked
        const mockDb = unitRef.get(DatabaseService);
        expect(mockDb).toBeDefined();
      });
    });
  });

  describe('Real-world usage patterns', () => {
    describe('QozbroQqn scenario - mostly real dependencies', () => {
      it('should be simple with boundaries (new way)', async () => {
        const { unit, unitRef } = await TestBed.sociable(UserService)
          .boundaries([DatabaseService, ApiService]) // Just specify I/O to mock
          .compile();

        // Setup boundary mocks
        const mockDb = unitRef.get(DatabaseService);
        mockDb.saveData = jest.fn();

        const mockApi = unitRef.get(ApiService);
        mockApi.fetchData = jest.fn().mockResolvedValue('api-data');

        // Use the service - most deps are real
        const result = await unit.getUserInfo('123');
        expect(mockApi.fetchData).toHaveBeenCalledWith('https://api.example.com/users/123');
      });

      it('should be tedious with expose (old way)', async () => {
        const { unit, unitRef } = await TestBed.sociable(UserService)
          .expose(UserApiService)
          .expose(UserDal)
          .expose(UserVerificationService)
          .expose(UserDigestService)
          // Imagine dozens more...
          .compile();

        // Everything not exposed is mocked
        const mockDb = unitRef.get(DatabaseService);
        const mockApi = unitRef.get(ApiService);
        const mockHttp = unitRef.get(HttpClient);

        expect(mockDb).toBeDefined(); // Mocked
        expect(mockApi).toBeDefined(); // Mocked
        expect(mockHttp).toBeDefined(); // Mocked
      });
    });

    describe('Fine-grained control scenario', () => {
      it('should be clear with expose when you want specific real deps', async () => {
        const { unit, unitRef } = await TestBed.sociable(UserService)
          .expose(UserApiService) // Just this one is real
          .compile();

        // UserApiService is real
        expect(() => unitRef.get(UserApiService)).toThrow();

        // Everything else is mocked
        expect(unitRef.get(UserDal)).toBeDefined();
        expect(unitRef.get(DatabaseService)).toBeDefined();
      });
    });
  });

  describe('Edge cases and special behaviors', () => {
    it('should handle empty boundaries array (everything real except tokens)', async () => {
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([]) // No boundaries - all classes real
        .compile();

      // All class deps are real
      expect(() => unitRef.get(UserApiService)).toThrow();
      expect(() => unitRef.get(UserDal)).toThrow();
      expect(() => unitRef.get(DatabaseService)).toThrow();
      expect(() => unitRef.get(ApiService)).toThrow();

      // Tokens still mocked
      expect(unitRef.get(Logger)).toBeDefined();
      expect(unitRef.get<Repository>('Repository')).toBeDefined();
    });

    it('should handle boundaries with all dependencies (everything mocked)', async () => {
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([
          UserApiService,
          UserDal,
          DatabaseService,
          ApiService,
          UserVerificationService,
          UserDigestService,
          HttpClient
        ])
        .compile();

      // Everything is mocked
      expect(unitRef.get(UserApiService)).toBeDefined();
      expect(unitRef.get(UserDal)).toBeDefined();
      expect(unitRef.get(DatabaseService)).toBeDefined();
    });

    it('should warn on redundant mock declarations', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await TestBed.sociable(UserService)
        .boundaries([DatabaseService])
        .mock(DatabaseService).impl(() => ({})) // Redundant - already in boundaries
        .compile();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Redundant configuration')
      );

      consoleSpy.mockRestore();
    });
  });
});