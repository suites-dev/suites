import { AutomockDependenciesAdapter } from '@automock/common';

export interface NodeRequire {
  main: NodeModule | undefined;
  resolve(path: string): string;
  require(path: string): { default: AutomockDependenciesAdapter };
}
