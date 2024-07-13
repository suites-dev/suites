import { SuitesError, SuitesErrorCode } from '@suites/types.common';

export class IdentifierNotFoundError extends SuitesError {
  public constructor(message: string) {
    super(SuitesErrorCode.IDENTIFIER_NOT_FOUND, 'Missing class dependency identifier', message);
    this.name = 'IdentifierNotFoundError';
  }
}

export class UndefinedDependencyError extends SuitesError {
  public constructor(message: string) {
    super(SuitesErrorCode.UNDEFINED_DEPENDENCY, 'Undefined dependency identifier', message);
    this.name = 'UndefinedDependencyError';
  }
}

export class UndefinedTokenError extends SuitesError {
  public constructor(message: string) {
    super(SuitesErrorCode.UNDEFINED_DEPENDENCY, 'Undefined token', message);
    this.name = 'UndefinedTokenError';
  }
}
