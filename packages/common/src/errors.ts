export const AutomockErrorCode = {
  IDENTIFIER_NOT_FOUND: 'ER010',
  /**
   * @deprecated Use `ADAPTER_RESOLUTION_ERROR` instead
   */
  ADAPTER_NOT_FOUND: 'ER020',
  /**
   * @deprecated Use `ADAPTER_RESOLUTION_ERROR` instead
   */
  ADAPTER_ERROR: 'ER021',
  ADAPTER_RESOLUTION_ERROR: 'ER022',
  UNDEFINED_DEPENDENCY: 'ER30',
  UNDEFINED_TOKEN: 'ER31',
};

export type AutomockErrorCode = (typeof AutomockErrorCode)[keyof typeof AutomockErrorCode];

export class AutomockError extends Error {
  public constructor(
    public readonly code: AutomockErrorCode,
    title: string,
    message: string
  ) {
    super(`${title} (code ${code.toString()})\n${message}`);
    this.name = 'AutomockError';
  }
}

export class IdentifierNotFoundError extends AutomockError {
  public constructor(message: string) {
    super(AutomockErrorCode.IDENTIFIER_NOT_FOUND, 'Missing class dependency identifier', message);
    this.name = 'IdentifierNotFoundError';
  }
}

/**
 * @deprecated Use `AdapterResolutionError` instead
 */
export class AdapterNotFoundError extends AutomockError {
  public constructor(message: string) {
    super(AutomockErrorCode.ADAPTER_NOT_FOUND, 'No compatible adapter found', message);
    this.name = 'AdapterNotFoundError';
  }
}

export class AdapterResolutionError extends AutomockError {
  public constructor(message: string) {
    super(AutomockErrorCode.ADAPTER_RESOLUTION_ERROR, 'Adapter resolution error', message);
    this.name = 'AdapterResolutionError';
  }
}

export class UndefinedDependencyError extends AutomockError {
  public constructor(message: string) {
    super(AutomockErrorCode.UNDEFINED_DEPENDENCY, 'Undefined dependency identifier', message);
    this.name = 'UndefinedDependencyError';
  }
}

export class UndefinedTokenError extends AutomockError {
  public constructor(message: string) {
    super(AutomockErrorCode.UNDEFINED_DEPENDENCY, 'Undefined token', message);
    this.name = 'UndefinedTokenError';
  }
}
