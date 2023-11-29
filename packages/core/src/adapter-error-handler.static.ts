import { AdapterNotFoundError } from '@automock/common';
import { AdapterResolvingFailure, AdapterResolvingFailureReason } from './services/types';

export function handleAdapterError(error: AdapterResolvingFailure) {
  let message: string;
  switch (error.reason) {
    case AdapterResolvingFailureReason.CAN_NOT_FIND_ENTRY_PROCESS:
      message = '1';
      break;
    case AdapterResolvingFailureReason.CAN_NOT_PARSE_PACKAGE_JSON:
      message = '2';
      break;
    case AdapterResolvingFailureReason.CAN_NOT_FIND_PACKAGE_JSON:
      message = '3';
      break;
    case AdapterResolvingFailureReason.NO_DEFAULT_EXPORT:
      message = '4';
      break;
    case AdapterResolvingFailureReason.NO_COMPATIBLE_ADAPTER_FOUND:
      message = '5';
      break;
    default:
      message = `Automock requires an adapter to seamlessly integrate with different dependency injection frameworks.
      It seems that you haven't installed an appropriate adapter package. To resolve this issue, please install
      one of the available adapters that matches your dependency injection framework.
      Refer to the docs for further information: https://automock.dev/docs`;
  }

  throw new AdapterNotFoundError(message);
}
