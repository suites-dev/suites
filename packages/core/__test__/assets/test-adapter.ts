import { AutomockDependenciesAdapter, ClassInjectablesContainer } from '@automock/common';

export default {
  build(): ClassInjectablesContainer {
    return 'success' as unknown as ClassInjectablesContainer;
  },
} as AutomockDependenciesAdapter;
