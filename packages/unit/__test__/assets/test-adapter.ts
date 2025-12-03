import type { DependencyInjectionAdapter, InjectableRegistry } from '@suites/types.di';

export const adapter = {
  inspect(): InjectableRegistry {
    return 'success' as unknown as InjectableRegistry;
  },
} as DependencyInjectionAdapter;
