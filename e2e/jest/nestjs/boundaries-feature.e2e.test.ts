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

describe('Boundaries Feature (v4.0.0) - E2E', () => {
  describe('Boundaries API with existing UserService', () => {
    it('should compile with boundaries configuration', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .boundaries([ApiService, DatabaseService, UserApiService, UserDal, UserVerificationService])
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });

    it('should create user with mocked verification service', async () => {
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

      const mockVerification = unitRef.get(UserVerificationService);
      const mockRepo = unitRef.get<Repository>('Repository');

      // ACT: Create user
      const user = { name: 'Test User', email: 'test@example.com' };
      const result = await unit.create(user);

      // ASSERT: Mocks were used
      expect(result).toEqual(user);
      expect(mockVerification.verify).toHaveBeenCalledWith(user);
      expect(mockRepo.create).toHaveBeenCalled();
    });
  });

  describe('Fail-fast catches bugs', () => {
    it('should throw when dependency not configured', async () => {
      await expect(
        TestBed.sociable(UserService).expose(UserApiService).compile()
      ).rejects.toThrow(/not configured/);
    });

    it('should allow disabling fail-fast for migration', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .disableFailFast()
        .expose(UserApiService)
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });
  });

  describe('Mode mutual exclusivity', () => {
    it('should prevent mixing expose and boundaries', () => {
      expect(() => {
        TestBed.sociable(UserService).boundaries([ApiService]).expose(UserDal);
      }).toThrow(/Cannot use \.expose\(\) after \.boundaries\(\)/);
    });

    it('should prevent mixing boundaries and expose', () => {
      expect(() => {
        TestBed.sociable(UserService).expose(UserDal).boundaries([ApiService]);
      }).toThrow(/Cannot use \.boundaries\(\) after \.expose\(\)/);
    });
  });
});