import { AutomockDependenciesAdapter } from '@automock/common';

export interface NodeRequire {
  main: NodeModule | undefined;
  resolve(path: string): string;
  require(path: string): { default: AutomockDependenciesAdapter };
}

export class FailureResultBoundary<Reason> extends Error {
  readonly reason: Reason;

  constructor(reason: Reason) {
    super();
    this.reason = reason;
  }
}

export const AdapterResolvingFailureReason = {
  CAN_NOT_FIND_ENTRY_PROCESS: 'CAN_NOT_FIND_ENTRY_PROCESS',
  CAN_NOT_PARSE_PACKAGE_JSON: 'CAN_NOT_PARSE_PACKAGE_JSON',
  CAN_NOT_FIND_PACKAGE_JSON: 'CAN_NOT_FIND_PACKAGE_JSON',
  NO_DEFAULT_EXPORT: 'NO_DEFAULT_EXPORT',
  NO_COMPATIBLE_ADAPTER_FOUND: 'NO_COMPATIBLE_ADAPTER_FOUND',
};

export type AdapterResolvingFailureReason =
  (typeof AdapterResolvingFailureReason)[keyof typeof AdapterResolvingFailureReason];

export class AdapterResolvingFailure extends FailureResultBoundary<AdapterResolvingFailureReason> {}
