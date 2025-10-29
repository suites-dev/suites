import { Injectable, Inject } from '@nestjs/common';

// Realistic scenario: Business logic with expensive/external service boundaries

export interface User {
  id: string;
  email: string;
  name: string;
}

// This is an EXPENSIVE service (heavy computation)
// Good candidate for boundary - we don't want to run real computation in tests
@Injectable()
export class RecommendationEngine {
  public async computeRecommendations(userId: string): Promise<string[]> {
    // Expensive ML/AI computation that takes 5 seconds
    // We want to MOCK this in tests
    return ['item1', 'item2', 'item3'];
  }
}

// This service has REAL business logic we want to test
@Injectable()
export class UserPreferencesService {
  public getUserPreferences(user: User): { theme: string; notifications: boolean } {
    // Real logic we want to test
    return {
      theme: user.email.includes('premium') ? 'dark' : 'light',
      notifications: true,
    };
  }
}

// This service has REAL validation logic
@Injectable()
export class UserValidator {
  public validate(user: User): boolean {
    return user.email.includes('@') && user.name.length > 0;
  }
}

// Simple formatter with real logic
@Injectable()
export class UserFormatter {
  public formatName(user: User): string {
    return user.name.toUpperCase();
  }
}

// The main service - has mix of real business logic and expensive deps
@Injectable()
export class UserProfileService {
  constructor(
    private readonly recommendationEngine: RecommendationEngine, // EXPENSIVE - boundary!
    private readonly userPreferences: UserPreferencesService, // REAL - business logic
    private readonly userValidator: UserValidator, // REAL - validation logic
    private readonly userFormatter: UserFormatter, // REAL - simple logic
    @Inject('USER_REPOSITORY') private readonly userRepo: any // Token - auto-mocked
  ) {}

  public async getUserProfile(userId: string): Promise<{
    user: User;
    formattedName: string;
    preferences: { theme: string; notifications: boolean };
    recommendations: string[];
  }> {
    // Fetch user (token injection - auto-mocked)
    const user = await this.userRepo.findById(userId);

    // Validate with REAL logic
    if (!this.userValidator.validate(user)) {
      throw new Error('Invalid user');
    }

    // Get preferences with REAL logic
    const preferences = this.userPreferences.getUserPreferences(user);

    // Format with REAL logic
    const formattedName = this.userFormatter.formatName(user);

    // Get recommendations (EXPENSIVE - we'll mock this)
    const recommendations = await this.recommendationEngine.computeRecommendations(userId);

    return {
      user,
      formattedName,
      preferences,
      recommendations,
    };
  }
}
