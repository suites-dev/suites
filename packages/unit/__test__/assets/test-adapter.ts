import { DependencyInjectionAdapter, InjectableRegistry } from '@suites/types.di';

export default {
  inspect(): InjectableRegistry {
    return 'success' as unknown as InjectableRegistry;
  },
} as DependencyInjectionAdapter;
