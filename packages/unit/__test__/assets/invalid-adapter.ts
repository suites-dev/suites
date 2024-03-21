import { DependencyInjectionAdapter, InjectableRegistry } from '@suites/types.di';

export = {
  inspect(): InjectableRegistry {
    return 'not-reachable' as unknown as InjectableRegistry;
  },
} as DependencyInjectionAdapter;
