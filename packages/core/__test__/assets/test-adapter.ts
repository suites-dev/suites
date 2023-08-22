import { AutomockDependenciesAdapter, ClassInjectablesContainer } from '@automock/common';

export default {
  reflect(): ClassInjectablesContainer {
    return 'success' as unknown as ClassInjectablesContainer;
  },
} as AutomockDependenciesAdapter;
