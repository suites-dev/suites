import { AutomockDependenciesAdapter, InjectablesRegistry } from '@suites/common';

export default {
  inspect(): InjectablesRegistry {
    return 'success' as unknown as InjectablesRegistry;
  },
} as AutomockDependenciesAdapter;
