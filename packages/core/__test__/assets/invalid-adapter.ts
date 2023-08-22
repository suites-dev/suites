import { AutomockDependenciesAdapter, ClassInjectablesContainer } from '@automock/common';

export = {
  reflect(): ClassInjectablesContainer {
    return 'not-reachable' as unknown as ClassInjectablesContainer;
  },
} as AutomockDependenciesAdapter;
