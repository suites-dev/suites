import { AdapterResolutionError } from '@automock/common';
import { AdapterResolutionFailure, AdapterResolutionFailureReason } from './services/types';

export function handleAdapterError(error: AdapterResolutionFailure) {
  const constructError = (errorMessage: string) => `
Automock encountered an error while attempting to resolve the adapter required for integration with your framework; ${errorMessage}
For detailed information, please refer to the documentation: https://automock.dev/docs`;

  if (MapErrorToMessage[error.reason]) {
    throw new AdapterResolutionError(
      constructError(`${MapErrorToMessage[error.reason]} (${error.reason})`)
    );
  }

  throw new AdapterResolutionError(
    constructError(MapErrorToMessage[AdapterResolutionFailureReason.NO_COMPATIBLE_ADAPTER_FOUND])
  );
}

export const MapErrorToMessage = {
  [AdapterResolutionFailureReason.CANNOT_FIND_ENTRY_PROCESS]: `
Cannot locate the entry process`,
  [AdapterResolutionFailureReason.CANNOT_PARSE_PACKAGE_JSON]: `
Error parsing package.json file`,
  [AdapterResolutionFailureReason.CANNOT_FIND_PACKAGE_JSON]: `
Cannot locate any package.json file`,
  [AdapterResolutionFailureReason.NO_DEFAULT_EXPORT]: `
There seems to be an issue with importing the corresponding framework adapter
A runtime error has occurred. Please report this issue to us at https://github.com/automock/automock/issues`,
  [AdapterResolutionFailureReason.NO_COMPATIBLE_ADAPTER_FOUND]: `
It appears that a compatible adapter package has not been installed.
Please ensure that you have installed the correct adapter for your dependency injection framework`,
};
