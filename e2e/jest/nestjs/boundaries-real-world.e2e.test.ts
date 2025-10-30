import { TestBed } from '@suites/unit';
import type { Mocked } from '@suites/unit';
import {
  OrderService,
  RecommendationEngine,
  PricingService,
  OrderValidator,
  Order,
} from './e2e-assets-boundaries-simple';

interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order>;
}

describe('Boundaries Real-World Scenario - Order Processing', () => {
  describe('Testing order processing with REAL business logic', () => {
    let orderService: OrderService;
    let mockRepo: Mocked<OrderRepository>;
    let mockRecommendations: Mocked<RecommendationEngine>;

    beforeAll(async () => {
      // REAL SCENARIO: Test business logic (pricing, validation) with mocked expensive service
      // Using boundaries: Mock ONLY the expensive RecommendationEngine
      const { unit, unitRef } = await TestBed.sociable(OrderService)
        .boundaries([RecommendationEngine]) // Just this expensive one!
        .mock(RecommendationEngine)
        .impl((stub) => ({
          getRecommendations: stub().mockResolvedValue(['rec1', 'rec2']),
        }))
        .mock<OrderRepository>('ORDER_REPOSITORY')
        .impl((stub) => ({
          save: stub().mockResolvedValue(undefined),
        }))
        .compile();

      orderService = unit;
      mockRepo = unitRef.get<OrderRepository>('ORDER_REPOSITORY');
      mockRecommendations = unitRef.get(RecommendationEngine);
    });

    it('should process premium user order with REAL discount calculation', async () => {
      // ACT: Process order for premium user
      const order = await orderService.processOrder('premium-user-123', 100);

      // ASSERT: REAL PricingService calculated 20% discount
      expect(order.total).toBe(80); // 100 * (1 - 0.2)
      expect(order.userId).toBe('premium-user-123');

      // Expensive service was mocked (not real 5-second computation)
      expect(mockRecommendations.getRecommendations).toHaveBeenCalledWith('premium-user-123');

      // DB save was called (token auto-mocked)
      expect(mockRepo.save).toHaveBeenCalledWith(order);
    });

    it('should process regular user order with REAL discount calculation', async () => {
      // ACT: Process order for regular user
      const order = await orderService.processOrder('regular-user-456', 100);

      // ASSERT: REAL PricingService calculated 10% discount
      expect(order.total).toBe(90); // 100 * (1 - 0.1)

      // Real business logic executed, not mocked!
    });

    it('should reject invalid orders using REAL validation', async () => {
      // ACT: Try to process order with 0 amount
      await expect(orderService.processOrder('user', 0)).rejects.toThrow('Invalid order');

      // REAL OrderValidator caught the invalid total
      // This proves business logic is REAL, not mocked!
    });
  });

  describe('The VALUE of boundaries - simple vs tedious config', () => {
    it('OLD WAY: Must expose all business logic explicitly', async () => {
      const { unit } = await TestBed.sociable(OrderService)
        .disableFailFast()
        .expose(PricingService) // Must list each one
        .expose(OrderValidator) // Tedious!
        // In 50-service app, this is dozens of lines...
        .compile();

      const order = await unit.processOrder('premium-user', 100);
      expect(order.total).toBe(80); // Real pricing logic
    });

    it('NEW WAY: Just specify the one expensive boundary', async () => {
      const { unit, unitRef } = await TestBed.sociable(OrderService)
        .boundaries([RecommendationEngine]) // Just this one!
        .mock(RecommendationEngine)
        .impl((stub) => ({
          getRecommendations: stub().mockResolvedValue([]),
        }))
        .mock<OrderRepository>('ORDER_REPOSITORY')
        .impl((stub) => ({
          save: stub().mockResolvedValue(undefined),
        }))
        .compile();

      // PricingService and OrderValidator are REAL (auto-exposed)
      const order = await unit.processOrder('premium-user', 100);
      expect(order.total).toBe(80); // Real pricing logic!

      // Simple config, real business logic tested!
    });
  });

  describe('Tokens are natural boundaries', () => {
    it('should work without declaring token in boundaries array', async () => {
      // Notice: ORDER_REPOSITORY is NOT in boundaries array
      // It's a token, so it's auto-mocked automatically
      const { unit, unitRef } = await TestBed.sociable(OrderService)
        .boundaries([RecommendationEngine]) // Only class boundary, NO tokens!
        .mock<OrderRepository>('ORDER_REPOSITORY')
        .impl((stub) => ({
          save: stub().mockResolvedValue(undefined),
        }))
        .mock(RecommendationEngine)
        .impl((stub) => ({
          getRecommendations: stub().mockResolvedValue([]),
        }))
        .compile();

      // Process an order - ORDER_REPOSITORY is used but wasn't in boundaries
      await unit.processOrder('user', 100);

      // Token was auto-mocked (didn't need to add to boundaries array)
      const mockRepo = unitRef.get<OrderRepository>('ORDER_REPOSITORY');
      expect(mockRepo.save).toHaveBeenCalled();

      // Proves: Tokens are natural boundaries - I/O already isolated!
    });
  });
});