import type { UnitReference } from '@suites/unit';
import { TestBed } from '@suites/unit';
import type { Repository } from './e2e-assets-sociable';
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
  describe('Boundaries API - mocking class dependencies', () => {
    it('should successfully compile with boundaries', async () => {
      // Configure all class deps as boundaries for this test
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([ApiService, DatabaseService, UserApiService, UserDal, UserVerificationService])
        .mock<Repository>('Repository')
        .impl((stub) => ({
          create: stub().mockResolvedValue(undefined),
        }))
        .mock(UserVerificationService)
        .impl((stub) => ({ verify: stub().mockReturnValue(true) }))
        .compile();

      expect(unit).toBeInstanceOf(UserService);

      // ACT: Create a user
      const user = { name: 'John', email: 'john@example.com' };
      const result = await unit.create(user);

      // ASSERT: Mocked dependencies were used
      expect(result).toEqual(user);
      expect(unitRef.get<Repository>('Repository').create).toHaveBeenCalled();
    });

    it('should demonstrate simpler config vs expose pattern', async () => {
      // OLD WAY - must list everything to expose
      const { unit: unit1 } = await TestBed.sociable(UserService)
        .disableFailFast()
        .expose(UserApiService)
        .expose(UserDal)
        .expose(DatabaseService)
        // Tedious for large apps
        .compile();

      expect(unit1).toBeInstanceOf(UserService);

      // NEW WAY - just list boundaries
      const { unit: unit2 } = await TestBed.sociable(UserService)
        .boundaries([ApiService, DatabaseService, UserApiService, UserDal, UserVerificationService])
        .compile();

      expect(unit2).toBeInstanceOf(UserService);
      // Same result, different mental model
    });
  });

  describe('Tokens are natural boundaries', () => {
    it('should auto-mock token injections without declaring them', async () => {
      const { unitRef } = await TestBed.sociable(UserService)
        .boundaries([ApiService, DatabaseService, UserApiService, UserDal, UserVerificationService])
        .mock<Repository>('Repository')
        .impl((stub) => ({ create: stub(), find: stub() }))
        .compile();

      // These tokens are auto-mocked - NOT in boundaries array!
      const mockRepo = unitRef.get<Repository>('Repository');
      const mockLogger = unitRef.get(Logger);
      const mockToken = unitRef.get<string[]>('SOME_VALUE_TOKEN');

      expect(mockRepo).toBeDefined();
      expect(mockLogger).toBeDefined();
      expect(mockToken).toBeDefined();

      // Proves: I/O isolation happens via tokens, not boundaries!
    });
  });

  describe('Fail-fast prevents configuration bugs', () => {
    it('should throw when dependency not configured', async () => {
      await expect(
        TestBed.sociable(UserService).expose(UserApiService).compile()
      ).rejects.toThrow(/not configured/);
    });

    it('should allow migration with disableFailFast', async () => {
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
});