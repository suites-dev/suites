/* eslint-disable @typescript-eslint/no-var-requires */
import { AdapterResolutionError } from '@automock/common';
import { AutomockTestBuilder } from './main';

const mockFunction = jest.fn();
const targetClass = class TClass {};

describe('Main Integration Test', () => {
  test('when package.json is not parseable, then throw an error', () => {
    jest.spyOn(require, 'resolve').mockReturnValueOnce('mocked-adapter');
    jest.spyOn(require('fs'), 'existsSync').mockResolvedValueOnce(false);

    expect(() => AutomockTestBuilder(mockFunction)(targetClass)).toThrowError(
      AdapterResolutionError
    );
  });

  it('when package.json is not found, should throw', () => {
    jest.spyOn(require, 'resolve').mockReturnValueOnce('mocked-adapter');

    expect(() => AutomockTestBuilder(mockFunction)(targetClass)).toThrowError(
      AdapterResolutionError
    );
  });

  it('when no default export is found, should throw', () => {
    jest.spyOn(Object.prototype, 'hasOwnProperty').mockImplementation(() => false);
    jest.spyOn(require('fs'), 'existsSync').mockReturnValueOnce(true);
    jest.spyOn(require('fs'), 'readFileSync').mockReturnValueOnce(JSON.stringify({}));

    expect(() => AutomockTestBuilder(mockFunction)(targetClass)).toThrowError(
      AdapterResolutionError
    );
  });
});
