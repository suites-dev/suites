import { AutomockDependenciesAdapter } from '@automock/common';

export interface NodeRequire {
  main: NodeModule | undefined;
  resolve(path: string): string;
  require(path: string): { default: AutomockDependenciesAdapter };
}

export class FailureResultBoundary<Reason extends string> extends Error {
  public constructor(public readonly reason: Reason) {
    super(reason);
    this.reason = reason;
  }
}

export const AdapterResolutionFailureReason = {
  CANNOT_FIND_ENTRY_PROCESS: 'CANNOT_FIND_ENTRY_PROCESS',
  CANNOT_PARSE_PACKAGE_JSON: 'CANNOT_PARSE_PACKAGE_JSON',
  CANNOT_FIND_PACKAGE_JSON: 'CANNOT_FIND_PACKAGE_JSON',
  NO_DEFAULT_EXPORT: 'NO_DEFAULT_EXPORT',
  NO_COMPATIBLE_ADAPTER_FOUND: 'NO_COMPATIBLE_ADAPTER_FOUND',
};

export type AdapterResolvingFailureReason =
  (typeof AdapterResolutionFailureReason)[keyof typeof AdapterResolutionFailureReason];

export class AdapterResolutionFailure extends FailureResultBoundary<AdapterResolvingFailureReason> {}

export const AutomockAdapter = {
  NestJS: 'nestjs',
  Inversify: 'inversify',
};

export type AutomockAdapter = (typeof AutomockAdapter)[keyof typeof AutomockAdapter];

export const AutomockAdapters: Record<AutomockAdapter, string> = {
  [AutomockAdapter.NestJS]: '@automock/adapters.nestjs',
  [AutomockAdapter.Inversify]: '@automock/adapters.inversify',
} as const;
