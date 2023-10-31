export const AutomockErrorCode = {
  IDENTIFIER_NOT_FOUND: 'ER010',
  ADAPTER_NOT_FOUND: 'ER020',
  ADAPTER_ERROR: 'ER021',
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

export class AdapterNotFoundError extends AutomockError {
  public constructor(message: string) {
    super(AutomockErrorCode.ADAPTER_NOT_FOUND, 'No compatible adapter found', message);
    this.name = 'AdapterNotFoundError';
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
