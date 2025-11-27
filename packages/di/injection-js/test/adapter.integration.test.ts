import {
  API_URL,
  Cache,
  CUSTOM_TOKEN,
  Database,
  Logger,
  OrderService,
  PaymentService,
  ServiceWithCombinedDecorators,
  UserService,
} from './assets/integration.assets';
import type { InjectableIdentifier, WithoutMetadata } from '@suites/types.di';
import { adapter } from '../src';

describe('injection-js Suites DI Adapter Integration Test', () => {
  const dependencyInjectionAdapter = adapter;

  describe('reflecting a class with constructor based injection', () => {
    const injectablesContainer = dependencyInjectionAdapter.inspect(UserService);

    it('should list the dependencies in the dependencies container corresponding to the class injectables', () => {
      expect(injectablesContainer.list()).toStrictEqual<WithoutMetadata[]>([
        {
          identifier: Database,
          value: Database,
          type: 'PARAM',
        },
        {
          identifier: Logger,
          value: Logger,
          type: 'PARAM',
        },
      ]);
    });

    describe('resolving dependencies from the container by identifiers', () => {
      it.each([[Database], [Logger]])(
        '%p should be defined',
        (identifier: InjectableIdentifier) => {
          const dependency = injectablesContainer.resolve(identifier);
          expect(dependency).toBeDefined();
        }
      );
    });
  });

  describe('reflecting a class with multiple constructor dependencies', () => {
    const injectablesContainer = dependencyInjectionAdapter.inspect(OrderService);

    it('should list the dependencies in the dependencies container corresponding to the class injectables', () => {
      expect(injectablesContainer.list()).toStrictEqual<WithoutMetadata[]>([
        {
          identifier: Database,
          value: Database,
          type: 'PARAM',
        },
        {
          identifier: Logger,
          value: Logger,
          type: 'PARAM',
        },
        {
          identifier: Cache,
          value: Cache,
          type: 'PARAM',
        },
      ]);
    });

    describe('resolving dependencies from the container by identifiers', () => {
      it.each([[Database], [Logger], [Cache]])(
        '%p should be defined',
        (identifier: InjectableIdentifier) => {
          const dependency = injectablesContainer.resolve(identifier);
          expect(dependency).toBeDefined();
        }
      );
    });
  });

  describe('reflecting a class with @Inject decorator for custom tokens', () => {
    const injectablesContainer = dependencyInjectionAdapter.inspect(PaymentService);

    it('should list the dependencies in the dependencies container corresponding to the class injectables', () => {
      expect(injectablesContainer.list()).toStrictEqual<WithoutMetadata[]>([
        {
          identifier: Database,
          value: Database,
          type: 'PARAM',
        },
        {
          identifier: API_URL,
          value: String,
          type: 'PARAM',
        },
        {
          identifier: Logger,
          value: Logger,
          type: 'PARAM',
        },
      ]);
    });

    describe('resolving dependencies from the container by identifiers', () => {
      it.each([[Database], [API_URL], [Logger]])(
        '%p should be defined',
        (identifier: InjectableIdentifier) => {
          const dependency = injectablesContainer.resolve(identifier);
          expect(dependency).toBeDefined();
        }
      );
    });
  });

  describe('reflecting a class with combined decorators (@Inject + @Optional/@Self/@Host)', () => {
    const injectablesContainer = dependencyInjectionAdapter.inspect(
      ServiceWithCombinedDecorators
    );

    it('should list the dependencies in the dependencies container corresponding to the class injectables', () => {
      expect(injectablesContainer.list()).toStrictEqual<WithoutMetadata[]>([
        {
          identifier: CUSTOM_TOKEN,
          value: Object,
          type: 'PARAM',
        },
        {
          identifier: API_URL,
          value: Object,
          type: 'PARAM',
        },
        {
          identifier: 'SERVICE_C',
          value: Object,
          type: 'PARAM',
        },
      ]);
    });

    describe('resolving dependencies from the container by identifiers', () => {
      it.each([[CUSTOM_TOKEN], [API_URL], ['SERVICE_C']])(
        '%p should be defined',
        (identifier: InjectableIdentifier) => {
          const dependency = injectablesContainer.resolve(identifier);
          expect(dependency).toBeDefined();
        }
      );
    });
  });

  describe('property injection', () => {
    it('should return empty list (property injection not supported by injection-js adapter)', () => {
      const injectablesContainer = dependencyInjectionAdapter.inspect(UserService);
      const deps = injectablesContainer.list();

      // All dependencies should be PARAM type, none should be PROPERTY type
      const propertyDeps = deps.filter((dep) => (dep as any).type === 'PROPERTY');
      expect(propertyDeps).toHaveLength(0);
    });
  });
});
