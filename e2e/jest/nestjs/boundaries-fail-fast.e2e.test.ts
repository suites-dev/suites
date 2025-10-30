import { TestBed } from '@suites/unit';
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
  describe('Boundaries API works correctly', () => {
    it('should compile successfully with boundaries', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .boundaries([ApiService, DatabaseService, UserApiService, UserDal, UserVerificationService])
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });
  });

  describe('Comparing configuration patterns', () => {
    it('EXPOSE: List what should be real (whitelist)', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .disableFailFast()
        .expose(UserApiService)
        .expose(UserDal)
        .expose(DatabaseService)
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });

    it('BOUNDARIES: List what should be mocked (blacklist)', async () => {
      const { unit } = await TestBed.sociable(UserService)
        .boundaries([ApiService, DatabaseService, UserApiService, UserDal, UserVerificationService])
        .compile();

      expect(unit).toBeInstanceOf(UserService);
    });
  });

  describe('Fail-fast catches configuration bugs', () => {
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
    it('should prevent using expose after boundaries', () => {
      expect(() => {
        TestBed.sociable(UserService).boundaries([ApiService]).expose(UserDal);
      }).toThrow(/Cannot use \.expose\(\) after \.boundaries\(\)/);
    });

    it('should prevent using boundaries after expose', () => {
      expect(() => {
        TestBed.sociable(UserService).expose(UserDal).boundaries([ApiService]);
      }).toThrow(/Cannot use \.boundaries\(\) after \.expose\(\)/);
    });
  });
});