import { TestBed } from '@suites/unit';
import type { UnitReference } from '@suites/unit';
import type { Repository } from './e2e-assets-sociable';
import {
  UserService,
  UserApiService,
  UserDal,
  ApiService,
  DatabaseService,
  UserVerificationService,
} from './e2e-assets-sociable';

describe('Boundaries and Fail-Fast (v4.0.0)', () => {
  describe('Boundaries API', () => {
    it('should compile with boundaries', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .boundaries([ApiService, DatabaseService, UserApiService, UserDal, UserVerificationService])
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });

    it('should allow mocking boundaries for verification', async () => {
      const { unit, unitRef } = await TestBed.sociable(UserService)
        .boundaries([ApiService, DatabaseService, UserApiService, UserDal, UserVerificationService])
        .mock(UserVerificationService)
        .impl((stub) => ({
          verify: stub().mockReturnValue(true),
        }))
        .mock<Repository>('Repository')
        .impl((stub) => ({
          create: stub().mockResolvedValue(undefined),
        }))
        .compile();

      const mockVerify = unitRef.get(UserVerificationService);
      const mockRepo = unitRef.get<Repository>('Repository');

      // ACT: Create user
      const user = { name: 'John', email: 'john@example.com' };
      await unit.create(user);

      // ASSERT: Mocks were called
      expect(mockVerify.verify).toHaveBeenCalledWith(user);
      expect(mockRepo.create).toHaveBeenCalled();
    });
  });

  describe('Comparing boundaries vs expose', () => {
    it('EXPOSE: Whitelist real dependencies', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .disableFailFast()
        .expose(UserApiService)
        .expose(UserDal)
        .expose(DatabaseService)
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });

    it('BOUNDARIES: Blacklist mocked dependencies', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .boundaries([ApiService, DatabaseService, UserApiService, UserDal, UserVerificationService])
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });
  });

  describe('Fail-Fast', () => {
    it('should throw when dependency not configured', async () => {
      await expect(
        TestBed.sociable(UserService).expose(UserApiService).compile()
      ).rejects.toThrow(/not configured/);
    });

    it('should allow disabling for migration', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .disableFailFast()
        .expose(UserApiService)
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });
  });

  describe('Mode Mutual Exclusivity', () => {
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