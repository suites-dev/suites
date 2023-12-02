import { AdapterNotFoundError } from '@automock/common';
import { AdapterResolvingFailure, AdapterResolvingFailureReason } from './services/types';

export function handleAdapterError(error: AdapterResolvingFailure) {
  let message: string;
  switch (error.reason) {
    case AdapterResolvingFailureReason.CAN_NOT_FIND_ENTRY_PROCESS:
      message = `Automock encountered an issue while trying to find the entry process for the adapter. Please make sure that the adapter is installed.`;
      break;
    case AdapterResolvingFailureReason.CAN_NOT_PARSE_PACKAGE_JSON:
      message = `Automock was unable to parse the package.json file of the adapter. Please make sure that the package.json file is valid.`;
      break;
    case AdapterResolvingFailureReason.CAN_NOT_FIND_PACKAGE_JSON:
      message = `Automock couldn't locate the package.json file for the adapter. Please make sure that the package.json file is present.`;
      break;
    case AdapterResolvingFailureReason.NO_DEFAULT_EXPORT:
      message = `Automock detected that the adapter doesn't have a default export. Please make sure that the adapter has a default export.`;
      break;
    case AdapterResolvingFailureReason.NO_COMPATIBLE_ADAPTER_FOUND:
      message = `Automock couldn't find a compatible adapter for your dependency injection framework. Please make sure that you have installed an adapter that matches your dependency injection framework.`;
      break;
    default:
      message = `Automock requires an adapter to seamlessly integrate with different dependency injection frameworks.
      It seems that you haven't installed an appropriate adapter package. To resolve this issue, please install
      one of the available adapters that matches your dependency injection framework.
      Refer to the docs for further information: https://automock.dev/docs`;
  }

  throw new AdapterNotFoundError(message);
}
