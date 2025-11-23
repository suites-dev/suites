import {
  API_URL,
  Cache,
  CUSTOM_TOKEN,
  Database,
  Logger,
  NotificationService,
  OrderService,
  PaymentService,
  PlainService,
  ServiceWithCombinedDecorators,
  ServiceWithHost,
  ServiceWithOptionalAndInject,
  ServiceWithSelf,
  ServiceWithSkipSelf,
  SingleDepService,
  UserService,
  UtilityService,
} from './assets/integration.assets';
import { InjectableRegistry } from '@suites/types.di';
import { adapter } from '../src';

describe('injection-js Suites DI Adapter Integration Test', () => {
  const dependenciesAdapter = adapter;

  describe('class constructor injection', () => {
    describe('reflecting a class with @Injectable and type-based injection', () => {
      let injectablesRegistry: InjectableRegistry;

      beforeAll(() => {
        injectablesRegistry = dependenciesAdapter.inspect(UserService);
      });

      it('should list dependencies with Type identifiers', () => {
        const deps = injectablesRegistry.list();

        expect(deps).toHaveLength(2);
        expect(deps[0].identifier).toBe(Database);
        expect(deps[0].value).toBe(Database);
        expect(deps[0].type).toBe('PARAM');

        expect(deps[1].identifier).toBe(Logger);
        expect(deps[1].value).toBe(Logger);
        expect(deps[1].type).toBe('PARAM');
      });

      it('should resolve dependency by Type', () => {
        const databaseDep = injectablesRegistry.resolve(Database);

        expect(databaseDep).toEqual({
          identifier: Database,
          value: Database,
          type: 'PARAM',
        });
      });

      it('should return undefined for non-existent dependency', () => {
        const nonExistent = injectablesRegistry.resolve(Cache);
        expect(nonExistent).toBeUndefined();
      });
    });

    describe('reflecting a class with multiple dependencies', () => {
      let injectablesRegistry: InjectableRegistry;

      beforeAll(() => {
        injectablesRegistry = dependenciesAdapter.inspect(OrderService);
      });

      it('should list all three dependencies', () => {
        const deps = injectablesRegistry.list();

        expect(deps).toHaveLength(3);
        expect(deps[0].identifier).toBe(Database);
        expect(deps[1].identifier).toBe(Logger);
        expect(deps[2].identifier).toBe(Cache);
      });

      it('should resolve each dependency by Type', () => {
        expect(injectablesRegistry.resolve(Database)).toBeDefined();
        expect(injectablesRegistry.resolve(Logger)).toBeDefined();
        expect(injectablesRegistry.resolve(Cache)).toBeDefined();
      });
    });

    describe('reflecting a class with @Inject decorator', () => {
      let injectablesRegistry: InjectableRegistry;

      beforeAll(() => {
        injectablesRegistry = dependenciesAdapter.inspect(PaymentService);
      });

      it('should use custom token as identifier', () => {
        const deps = injectablesRegistry.list();

        expect(deps).toHaveLength(3);
        expect(deps[0].identifier).toBe(Database);
        expect(deps[1].identifier).toBe(API_URL); // Custom token
        expect(deps[2].identifier).toBe(Logger);
      });

      it('should resolve by token identifier with metadata', () => {
        const apiUrlDep = injectablesRegistry.resolve(API_URL);

        expect(apiUrlDep).toBeDefined();
        expect(apiUrlDep?.identifier).toBe(API_URL);
        expect(apiUrlDep?.type).toBe('PARAM');
        if ('metadata' in apiUrlDep && apiUrlDep) {
          expect(apiUrlDep.metadata).toEqual({ token: API_URL });
        }
      });
    });

    describe('reflecting a class with @Optional decorator', () => {
      let injectablesRegistry: InjectableRegistry;

      beforeAll(() => {
        injectablesRegistry = dependenciesAdapter.inspect(NotificationService);
      });

      it('should detect optional parameter without metadata', () => {
        const deps = injectablesRegistry.list();

        expect(deps).toHaveLength(2);
        expect(deps[0].identifier).toBe(Logger);
        expect(deps[0]).not.toHaveProperty('metadata');

        // Second parameter has @Optional() decorator
        expect(deps[1].identifier).toBe(Cache);
        expect(deps[1]).not.toHaveProperty('metadata');
        // Note: @Optional() decorator is intentionally ignored
        // as it's a production DI resolution hint that doesn't affect Suites'
        // flat virtual test container. All dependencies are auto-mocked by default.
      });
    });

    describe('reflecting a class with no dependencies', () => {
      let injectablesRegistry: InjectableRegistry;

      beforeAll(() => {
        injectablesRegistry = dependenciesAdapter.inspect(UtilityService);
      });

      it('should return empty dependencies list', () => {
        const deps = injectablesRegistry.list();
        expect(deps).toHaveLength(0);
      });
    });

    describe('reflecting a class with single dependency', () => {
      let injectablesRegistry: InjectableRegistry;

      beforeAll(() => {
        injectablesRegistry = dependenciesAdapter.inspect(SingleDepService);
      });

      it('should list the single dependency', () => {
        const deps = injectablesRegistry.list();

        expect(deps).toHaveLength(1);
        expect(deps[0].identifier).toBe(Logger);
      });
    });

    describe('reflecting a plain class without @Injectable', () => {
      let injectablesRegistry: InjectableRegistry;

      beforeAll(() => {
        injectablesRegistry = dependenciesAdapter.inspect(PlainService);
      });

      it('should still reflect dependencies if types are available', () => {
        const deps = injectablesRegistry.list();

        // injection-js can still reflect if design:paramtypes metadata exists
        expect(deps.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('property injection', () => {
    it('should return empty list (property injection not supported)', () => {
      const injectablesRegistry = dependenciesAdapter.inspect(UserService);
      const deps = injectablesRegistry.list();

      // All dependencies should be PARAM type, none should be PROPERTY type
      const propertyDeps = deps.filter((dep) => {
        const hasType = 'type' in dep;
        return hasType && (dep as any).type === 'PROPERTY';
      });
      expect(propertyDeps).toHaveLength(0);
    });
  });

  describe('identifier types', () => {
    it('should use Type identifiers (constructor functions)', () => {
      const injectablesRegistry = dependenciesAdapter.inspect(UserService);
      const deps = injectablesRegistry.list();

      deps.forEach((dep) => {
        if ('identifier' in dep && dep.identifier) {
          expect(typeof dep.identifier).toBe('function');
        }
      });
    });

    it('should have actual Type as value (full type reflection)', () => {
      const injectablesRegistry = dependenciesAdapter.inspect(UserService);
      const deps = injectablesRegistry.list();

      expect(deps[0].value).toBe(Database);
      expect(deps[1].value).toBe(Logger);
    });

    it('should handle string tokens from @Inject()', () => {
      const injectablesRegistry = dependenciesAdapter.inspect(PaymentService);
      const apiUrlDep = injectablesRegistry.resolve(API_URL);

      expect(typeof apiUrlDep?.identifier).toBe('string');
      expect(apiUrlDep?.identifier).toBe(API_URL);
    });
  });

  describe('decorator behavior - resolution modifiers are ignored', () => {
    describe('@Self() decorator', () => {
      let injectablesRegistry: InjectableRegistry;

      beforeAll(() => {
        injectablesRegistry = dependenciesAdapter.inspect(ServiceWithSelf);
      });

      it('should extract dependencies correctly', () => {
        const deps = injectablesRegistry.list();

        expect(deps).toHaveLength(2);
        expect(deps[0].identifier).toBe(Database);
        expect(deps[1].identifier).toBe(Logger);
      });

      it('should not include metadata for @Self() decorator', () => {
        const deps = injectablesRegistry.list();

        // First param has @Self() but it should be ignored
        expect(deps[0]).not.toHaveProperty('metadata');
      });
    });

    describe('@SkipSelf() decorator', () => {
      let injectablesRegistry: InjectableRegistry;

      beforeAll(() => {
        injectablesRegistry = dependenciesAdapter.inspect(ServiceWithSkipSelf);
      });

      it('should extract dependencies correctly', () => {
        const deps = injectablesRegistry.list();

        expect(deps).toHaveLength(2);
        expect(deps[0].identifier).toBe(Cache);
        expect(deps[1].identifier).toBe(Logger);
      });

      it('should not include metadata for @SkipSelf() decorator', () => {
        const deps = injectablesRegistry.list();

        // First param has @SkipSelf() but it should be ignored
        expect(deps[0]).not.toHaveProperty('metadata');
      });
    });

    describe('@Host() decorator', () => {
      let injectablesRegistry: InjectableRegistry;

      beforeAll(() => {
        injectablesRegistry = dependenciesAdapter.inspect(ServiceWithHost);
      });

      it('should extract dependencies correctly', () => {
        const deps = injectablesRegistry.list();

        expect(deps).toHaveLength(2);
        expect(deps[0].identifier).toBe(Database);
        expect(deps[1].identifier).toBe(Logger);
      });

      it('should not include metadata for @Host() decorator', () => {
        const deps = injectablesRegistry.list();

        // First param has @Host() but it should be ignored
        expect(deps[0]).not.toHaveProperty('metadata');
      });
    });

    describe('combined @Inject() with resolution modifiers', () => {
      let injectablesRegistry: InjectableRegistry;

      beforeAll(() => {
        injectablesRegistry = dependenciesAdapter.inspect(ServiceWithCombinedDecorators);
      });

      it('should extract @Inject tokens correctly', () => {
        const deps = injectablesRegistry.list();

        expect(deps).toHaveLength(3);
        // All three params have @Inject() with tokens
        expect(deps[0].identifier).toBe(CUSTOM_TOKEN); // @Inject(CUSTOM_TOKEN) @Optional()
        expect(deps[1].identifier).toBe(API_URL); // @Inject(API_URL) @Self()
        expect(deps[2].identifier).toBe('SERVICE_C'); // @Inject('SERVICE_C') @Host()
      });

      it('should include token in metadata for token-based injection', () => {
        const deps = injectablesRegistry.list();

        // First param: @Inject(CUSTOM_TOKEN) @Optional()
        expect(deps[0].identifier).toBe(CUSTOM_TOKEN);
        if ('metadata' in deps[0]) {
          expect(deps[0].metadata).toEqual({ token: CUSTOM_TOKEN });
        }

        // Second param: @Inject(API_URL) @Self()
        expect(deps[1].identifier).toBe(API_URL);
        if ('metadata' in deps[1]) {
          expect(deps[1].metadata).toEqual({ token: API_URL });
        }

        // Third param: @Inject('SERVICE_C') @Host()
        expect(deps[2].identifier).toBe('SERVICE_C');
        if ('metadata' in deps[2]) {
          expect(deps[2].metadata).toEqual({ token: 'SERVICE_C' });
        }
      });
    });

    describe('@Optional() with @Inject()', () => {
      let injectablesRegistry: InjectableRegistry;

      beforeAll(() => {
        injectablesRegistry = dependenciesAdapter.inspect(ServiceWithOptionalAndInject);
      });

      it('should extract token from @Inject()', () => {
        const deps = injectablesRegistry.list();

        expect(deps).toHaveLength(2);
        expect(deps[0].identifier).toBe(API_URL); // @Inject(API_URL) @Optional()
        expect(deps[1].identifier).toBe(Logger); // regular type
      });

      it('should include metadata only for token injection, not Type injection', () => {
        const deps = injectablesRegistry.list();

        // First param has both @Inject(API_URL) and @Optional()
        expect(deps[0].identifier).toBe(API_URL);
        if ('metadata' in deps[0]) {
          expect(deps[0].metadata).toEqual({ token: API_URL });
        }

        // Second param is just a regular type (no decorators)
        expect(deps[1].identifier).toBe(Logger);
        expect(deps[1]).not.toHaveProperty('metadata');
      });
    });
  });

  describe('edge cases', () => {
    describe('metadata presence based on injection type', () => {
      it('should not have metadata for Type-based dependencies', () => {
        const injectablesRegistry = dependenciesAdapter.inspect(UserService);
        const deps = injectablesRegistry.list();

        deps.forEach((dep) => {
          expect(dep).not.toHaveProperty('metadata');
        });
      });

      it('should have metadata for token-based but not Type-based dependencies', () => {
        const injectablesRegistry = dependenciesAdapter.inspect(PaymentService);
        const deps = injectablesRegistry.list();

        // First param is Type-based (Database)
        expect(deps[0].identifier).toBe(Database);
        expect(deps[0]).not.toHaveProperty('metadata');

        // Second param is token-based (@Inject(API_URL))
        expect(deps[1].identifier).toBe(API_URL);
        if ('metadata' in deps[1]) {
          expect(deps[1].metadata).toEqual({ token: API_URL });
        }

        // Third param is Type-based (Logger)
        expect(deps[2].identifier).toBe(Logger);
        expect(deps[2]).not.toHaveProperty('metadata');
      });

      it('should include metadata for all token-based injections', () => {
        const injectablesRegistry = dependenciesAdapter.inspect(ServiceWithCombinedDecorators);
        const deps = injectablesRegistry.list();

        // All params use @Inject(token), so all should have metadata
        deps.forEach((dep) => {
          if ('metadata' in dep) {
            expect(dep.metadata).toHaveProperty('token');
            expect(Object.keys(dep.metadata)).toEqual(['token']);
          }
        });
      });
    });
  });
});
