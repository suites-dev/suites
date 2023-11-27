import { AutomockError, AutomockErrorCode } from '@automock/common';

export class CannotFindEntryProcessError extends AutomockError {
  public constructor(message: string) {
    super(AutomockErrorCode.CAN_NOT_FIND_ENTRY_PROCESS, 'Cannot find entry process', message);
    this.name = 'CannotFindEntryProcessError';
  }
}

export class CannotParsePackageJsonError extends AutomockError {
  public constructor(message: string) {
    super(AutomockErrorCode.CAN_NOT_PARSE_PACKAGE_JSON, 'Cannot parse package.json', message);
    this.name = 'CannotParsePackageJsonError';
  }
}

export class CannotFindPackageJsonError extends AutomockError {
  public constructor(message: string) {
    super(AutomockErrorCode.CAN_NOT_FIND_PACKAGE_JSON, 'Cannot find package.json', message);
    this.name = 'CannotFindPackageJsonError';
  }
}
