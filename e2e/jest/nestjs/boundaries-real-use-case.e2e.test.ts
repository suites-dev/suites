import { TestBed } from '@suites/unit';
import {
  UserProfileService,
  RecommendationEngine,
  UserPreferencesService,
  UserValidator,
  UserFormatter,
  User,
  UserRepository,
} from './e2e-assets-boundaries';

describe('Boundaries Real Use Case - Testing Business Logic with Expensive Dependencies', () => {
  describe('The problem boundaries solves', () => {
    it('OLD WAY: Must expose all business logic services explicitly (tedious)', async () => {
      const { unit, unitRef } = await TestBed.sociable(UserProfileService)
        .disableFailFast() // For demo simplicity
        .expose(UserPreferencesService) // Business logic
        .expose(UserValidator) // Business logic
        .expose(UserFormatter) // Business logic
        // In a real app, would have dozens more...
        .compile();

      // Setup the expensive service mock
      const mockRepo = unitRef.get<UserRepository>('USER_REPOSITORY');
      mockRepo.findById = jest.fn().mockResolvedValue({
        id: '123',
        email: 'user@example.com',
        name: 'john',
      } as User);

      const mockRecommendations = unitRef.get(RecommendationEngine);
      mockRecommendations.computeRecommendations = jest
        .fn()
        .mockResolvedValue(['rec1', 'rec2']);

      const result = await unit.getUserProfile('123');

      // Real business logic was executed:
      expect(result.formattedName).toBe('JOHN'); // Real UserFormatter
      expect(result.preferences.theme).toBe('light'); // Real UserPreferencesService
    });

    it('NEW WAY: Just specify expensive boundary, rest is real (simple)', async () => {
      const { unit, unitRef } = await TestBed.sociable(UserProfileService)
        .boundaries([RecommendationEngine]) // Just the expensive one!
        .compile();

      // UserPreferencesService, UserValidator, UserFormatter are all REAL
      // No need to expose them explicitly!

      // Setup mocks
      const mockRepo = unitRef.get<UserRepository>('USER_REPOSITORY');
      mockRepo.findById = jest.fn().mockResolvedValue({
        id: '123',
        email: 'premium@example.com',
        name: 'jane',
      } as User);

      const mockRecommendations = unitRef.get(RecommendationEngine);
      mockRecommendations.computeRecommendations = jest
        .fn()
        .mockResolvedValue(['premium-rec1', 'premium-rec2']);

      const result = await unit.getUserProfile('123');

      // All REAL business logic executed:
      expect(result.formattedName).toBe('JANE'); // Real UserFormatter
      expect(result.preferences.theme).toBe('dark'); // Real UserPreferencesService (premium user!)
      expect(result.preferences.notifications).toBe(true);

      // Expensive service was mocked
      expect(mockRecommendations.computeRecommendations).toHaveBeenCalledWith('123');
    });
  });

  describe('Why boundaries matter - testing REAL business logic', () => {
    it('should execute real validation logic', async () => {
      const { unit, unitRef } = await TestBed.sociable(UserProfileService)
        .boundaries([RecommendationEngine])
        .compile();

      const mockRepo = unitRef.get<UserRepository>('USER_REPOSITORY');

      // Invalid user - REAL UserValidator will catch this
      mockRepo.findById = jest.fn().mockResolvedValue({
        id: '123',
        email: 'invalid-no-at-sign',
        name: 'john',
      } as User);

      const mockRec = unitRef.get(RecommendationEngine);
      mockRec.computeRecommendations = jest.fn();

      // Real validation logic catches the invalid email
      await expect(unit.getUserProfile('123')).rejects.toThrow('Invalid user');
    });

    it('should execute real preferences logic based on email', async () => {
      const { unit, unitRef } = await TestBed.sociable(UserProfileService)
        .boundaries([RecommendationEngine])
        .compile();

      const mockRepo = unitRef.get<UserRepository>('USER_REPOSITORY');
      const mockRec = unitRef.get(RecommendationEngine);
      mockRec.computeRecommendations = jest.fn().mockResolvedValue([]);

      // Test with premium user
      mockRepo.findById = jest.fn().mockResolvedValue({
        id: '1',
        email: 'premium@example.com',
        name: 'VIP',
      });

      const result = await unit.getUserProfile('1');
      expect(result.preferences.theme).toBe('dark'); // Premium gets dark theme

      // Test with regular user
      mockRepo.findById = jest.fn().mockResolvedValue({
        id: '2',
        email: 'regular@example.com',
        name: 'User',
      });

      const result2 = await unit.getUserProfile('2');
      expect(result2.preferences.theme).toBe('light'); // Regular gets light theme
    });
  });

  describe('Fail-fast catches configuration bugs', () => {
    it('should throw when expensive dependency not configured', async () => {
      // Forget to configure the expensive boundary
      await expect(
        TestBed.sociable(UserProfileService).expose(UserPreferencesService).compile()
      ).rejects.toThrow(/not configured/);
    });
  });

  describe('Token injections are automatic boundaries', () => {
    it('should auto-mock token injections without declaring them', async () => {
      const { unitRef } = await TestBed.sociable(UserProfileService)
        .boundaries([RecommendationEngine])
        .compile();

      // USER_REPOSITORY token is auto-mocked (natural boundary)
      // We didn't need to add it to boundaries!
      const mockRepo = unitRef.get<UserRepository>('USER_REPOSITORY');
      expect(mockRepo).toBeDefined();
    });
  });
});