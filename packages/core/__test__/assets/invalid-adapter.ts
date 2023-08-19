import { AutomockDependenciesAdapter, ClassInjectablesContainer } from '@automock/common';

export = {
  build(): ClassInjectablesContainer {
    return 'not-reachable' as unknown as ClassInjectablesContainer;
  },
} as AutomockDependenciesAdapter;
