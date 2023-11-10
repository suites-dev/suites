import { AutomockDependenciesAdapter, InjectablesRegistry } from '@automock/common';

export = {
  inspect(): InjectablesRegistry {
    return 'not-reachable' as unknown as InjectablesRegistry;
  },
} as AutomockDependenciesAdapter;
