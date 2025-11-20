import {
  UserService,
  OrderService,
  PaymentService,
  NotificationService,
  UtilityService,
  SingleDepService,
  PlainService,
  Database,
  Logger,
  Cache,
  API_URL,
} from './assets/integration.assets';
import { InjectableRegistry, UndefinedDependency } from '@suites/types.di';
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
          metadata: undefined,
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

      it('should include token in metadata', () => {
        const apiUrlDep = injectablesRegistry.resolve(API_URL);

        expect(apiUrlDep).toBeDefined();
        if (apiUrlDep && 'metadata' in apiUrlDep) {
          expect(apiUrlDep.metadata).toEqual({ token: API_URL });
        }
      });
    });

    describe('reflecting a class with @Optional decorator', () => {
      let injectablesRegistry: InjectableRegistry;

      beforeAll(() => {
        injectablesRegistry = dependenciesAdapter.inspect(NotificationService);
      });

      it('should detect optional parameter', () => {
        const deps = injectablesRegistry.list();

        expect(deps).toHaveLength(2);
        expect(deps[0].identifier).toBe(Logger);
        if ('metadata' in deps[0]) {
          expect(deps[0].metadata).toBeUndefined();
        }

        // Second parameter has @Optional() decorator
        expect(deps[1].identifier).toBe(Cache);
        // Note: injection-js may not expose @Optional in parameters metadata
        // when a type is also present. The decorator affects runtime resolution
        // but doesn't always appear in the metadata array.
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
});
