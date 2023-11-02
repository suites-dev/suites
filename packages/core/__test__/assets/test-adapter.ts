import { AutomockDependenciesAdapter, InjectablesRegistry } from '@automock/common';

export default {
  inspect(): InjectablesRegistry {
    return 'success' as unknown as InjectablesRegistry;
  },
} as AutomockDependenciesAdapter;
