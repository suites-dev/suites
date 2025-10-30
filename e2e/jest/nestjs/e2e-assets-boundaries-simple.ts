import { Injectable, Inject } from '@nestjs/common';

// Simple, focused scenario: Order processing with expensive recommendation engine

export interface Order {
  id: string;
  userId: string;
  total: number;
}

// EXPENSIVE service - we want to MOCK this (boundary)
// Simulates ML/AI that takes 5 seconds
@Injectable()
export class RecommendationEngine {
  async getRecommendations(userId: string): Promise<string[]> {
    // Expensive ML computation
    return ['item1', 'item2', 'item3'];
  }
}

// REAL business logic - we want to TEST this
@Injectable()
export class PricingService {
  calculateDiscount(userId: string): number {
    // Real logic we want to verify
    return userId.includes('premium') ? 0.2 : 0.1;
  }
}

// REAL business logic - we want to TEST this
@Injectable()
export class OrderValidator {
  validate(order: Order): boolean {
    return order.total > 0 && order.userId.length > 0;
  }
}

// Main service under test
@Injectable()
export class OrderService {
  constructor(
    private readonly recommendationEngine: RecommendationEngine, // EXPENSIVE - mock this
    private readonly pricingService: PricingService, // REAL - test this
    private readonly orderValidator: OrderValidator, // REAL - test this
    @Inject('ORDER_REPOSITORY') private readonly orderRepo: any // Token - auto-mocked
  ) {}

  async processOrder(userId: string, amount: number): Promise<Order> {
    const discount = this.pricingService.calculateDiscount(userId);
    const total = amount * (1 - discount);

    const order: Order = {
      id: `order_${Date.now()}`,
      userId,
      total,
    };

    if (!this.orderValidator.validate(order)) {
      throw new Error('Invalid order');
    }

    // Save to DB (token - auto-mocked)
    await this.orderRepo.save(order);

    // Get recommendations (expensive - we'll mock this)
    const recommendations = await this.recommendationEngine.getRecommendations(userId);

    return order;
  }
}
