import { AutomockDependenciesAdapter, InjectablesRegistry } from '@suites/common';

export = {
  inspect(): InjectablesRegistry {
    return 'not-reachable' as unknown as InjectablesRegistry;
  },
} as AutomockDependenciesAdapter;
