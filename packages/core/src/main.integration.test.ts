/* eslint-disable @typescript-eslint/no-var-requires */
import { AdapterNotFoundError } from '@automock/common/src/errors';
import { AutomockTestBuilder } from '.';
import { MapErrorToMessage } from './adapter-error-handler.static';
import { AdapterResolvingFailureReason } from './services/types';

const mockFunction = jest.fn();
const targetClass = class TClass {};

describe('Main Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('when adapter is found, should return TestBedBuilder', () => {
    jest.spyOn(require, 'resolve').mockReturnValueOnce('mocked-adapter');
    jest.spyOn(require('fs'), 'existsSync').mockResolvedValueOnce(false);

    expect(() => AutomockTestBuilder(mockFunction)(targetClass)).toThrowError(
      new AdapterNotFoundError(
        MapErrorToMessage[AdapterResolvingFailureReason.CAN_NOT_PARSE_PACKAGE_JSON]
      )
    );
  });

  it('when package.json is not found, should throw', () => {
    jest.spyOn(require, 'resolve').mockReturnValueOnce('mocked-adapter');

    expect(() => AutomockTestBuilder(mockFunction)(targetClass)).toThrowError(
      new AdapterNotFoundError(
        MapErrorToMessage[AdapterResolvingFailureReason.CAN_NOT_FIND_PACKAGE_JSON]
      )
    );
  });

  it('when no default export is found, should throw', () => {
    jest.spyOn(require, 'resolve').mockReturnValueOnce('mocked-adapter');
    jest.spyOn(require('fs'), 'existsSync').mockReturnValueOnce(true);
    jest.spyOn(require('fs'), 'readFileSync').mockReturnValueOnce(JSON.stringify({}));

    expect(() => AutomockTestBuilder(mockFunction)(targetClass)).toThrowError(
      new AdapterNotFoundError(MapErrorToMessage[AdapterResolvingFailureReason.NO_DEFAULT_EXPORT])
    );
  });
});
