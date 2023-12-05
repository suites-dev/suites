import { AdapterResolutionError } from '@automock/common';
import { AdapterResolutionFailure, AdapterResolutionFailureReason } from './services/types';

export function handleAdapterError(error: AdapterResolutionFailure) {
  const template = (errorMessage: string) => `
Automock encountered an error while resolving the adapter required for seamless integration with your dependency injection framework:
${errorMessage}
For detailed information, please refer to the documentation: https://automock.dev/docs`;

  if (MapErrorToMessage[error.reason]) {
    throw new AdapterResolutionError(template(MapErrorToMessage[error.reason]));
  }

  throw new AdapterResolutionError(
    template(MapErrorToMessage[AdapterResolutionFailureReason.NO_COMPATIBLE_ADAPTER_FOUND])
  );
}

export const MapErrorToMessage = {
  [AdapterResolutionFailureReason.CANNOT_FIND_ENTRY_PROCESS]: `
Automock encountered an issue while trying to locate the entry process for the adapter. Please ensure that the adapter is correctly installed.`,
  [AdapterResolutionFailureReason.CANNOT_PARSE_PACKAGE_JSON]: `
An error occurred while parsing the package.json file for the adapter.`,
  [AdapterResolutionFailureReason.CANNOT_FIND_PACKAGE_JSON]: `
Automock couldn't find any package.json file associated with the adapter.`,
  [AdapterResolutionFailureReason.NO_DEFAULT_EXPORT]: `
The installed adapter was found, but it doesn't have a default export.`,
  [AdapterResolutionFailureReason.NO_COMPATIBLE_ADAPTER_FOUND]: `
It appears that you haven't installed a compatible adapter package. Please install the appropriate adapter for your dependency injection framework.`,
};
