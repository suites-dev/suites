import { AdapterNotFoundError } from '@automock/common';
import { AdapterResolvingFailure, AdapterResolvingFailureReason } from './services/types';

export function handleAdapterError(error: AdapterResolvingFailure) {
  let message = `Automock requires an adapter to seamlessly integrate with different dependency injection frameworks.
  It seems that you haven't installed an appropriate adapter package. To resolve this issue, please install
  one of the available adapters that matches your dependency injection framework.
  Refer to the docs for further information: https://automock.dev/docs`;

  if (MapErrorToMessage[error.reason]) {
    message = MapErrorToMessage[error.reason];
  }

  throw new AdapterNotFoundError(message);
}

export const MapErrorToMessage = {
  [AdapterResolvingFailureReason.CAN_NOT_FIND_ENTRY_PROCESS]: `Automock encountered an issue while trying to find the entry process for the adapter. Please make sure that the adapter is installed.`,
  [AdapterResolvingFailureReason.CAN_NOT_PARSE_PACKAGE_JSON]: `Automock was unable to parse the package.json file of the adapter. Please make sure that the package.json file is valid.`,
  [AdapterResolvingFailureReason.CAN_NOT_FIND_PACKAGE_JSON]: `Automock couldn't locate the package.json file for the adapter. Please make sure that the package.json file is present.`,
  [AdapterResolvingFailureReason.NO_DEFAULT_EXPORT]: `Automock detected that the adapter doesn't have a default export. Please make sure that the adapter has a default export.`,
  [AdapterResolvingFailureReason.NO_COMPATIBLE_ADAPTER_FOUND]: `Automock couldn't find a compatible adapter for your dependency injection framework. Please make sure that you have installed an adapter that matches your dependency injection framework.`,
};
