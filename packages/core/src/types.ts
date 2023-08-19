import { ClassInjectable, ConstantValue } from '@automock/common';
import { StubbedInstance } from '@automock/types';
import { MocksContainer } from './services/mocks-container';

export type IdentifierToMock = [
  Pick<ClassInjectable, 'identifier'> & { metadata?: unknown },
  StubbedInstance<unknown> | ConstantValue
];

export interface MockedUnit<TClass> {
  container: MocksContainer;
  instance: TClass;
}

export const AutomockErrorCode = {
  INVALID_IDENTIFIER: 'ER010',
  ADAPTER_NOT_FOUND: 'ER020',
  ADAPTER_ERROR: 'ER021',
};

export type AutomockErrorCode = (typeof AutomockErrorCode)[keyof typeof AutomockErrorCode];

export class AutomockError extends Error {
  public constructor(public readonly code: AutomockErrorCode, title: string, message: string) {
    super(`Automock Error: ${title} (code ${code.toString()})\n${message}`);
    this.name = 'AutomockError';
  }
}

export class InvalidIdentifierError extends AutomockError {
  public constructor(message: string) {
    super(AutomockErrorCode.INVALID_IDENTIFIER, 'Invalid class dependency identifier', message);
    this.name = 'InvalidIdentifierError';
  }
}

export class AdapterNotFoundError extends AutomockError {
  public constructor(message: string) {
    super(AutomockErrorCode.ADAPTER_NOT_FOUND, 'No compatible adapter found', message);
    this.name = 'AdapterNotFoundError';
  }
}
