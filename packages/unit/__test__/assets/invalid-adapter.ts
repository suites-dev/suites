import type { DependencyInjectionAdapter, InjectableRegistry } from '@suites/types.di';

export const invalidExport = {
  inspect(): InjectableRegistry {
    return 'not-reachable' as unknown as InjectableRegistry;
  },
} as DependencyInjectionAdapter;
