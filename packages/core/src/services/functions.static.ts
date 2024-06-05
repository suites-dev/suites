import type { ConstantValue, Type } from '@suites/types.common';
import { SuitesErrorCode } from '@suites/types.common';
import type { IdentifierMetadata } from '@suites/types.di';

export function isConstantValue(value: unknown): value is ConstantValue {
  return (
    Array.isArray(value) ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'symbol' ||
    value === null
  );
}

export function mockDependencyNotFoundMessage(
  identifier: Type | string | symbol,
  metadata: IdentifierMetadata | undefined
): string {
  const identifierName =
    typeof identifier === 'string' || typeof identifier === 'symbol'
      ? String(identifier)
      : identifier.name;
  const metadataMsg = metadata ? `, with metadata [${JSON.stringify(metadata)}]` : '';
  const details = identifierName + metadataMsg;

  return `Suites Warning (${SuitesErrorCode.IDENTIFIER_NOT_FOUND}): The provided dependency identifier '${details}' does not match any
existing dependencies in the current testing context. Please review your identifier and
ensure it corresponds to the expected configuration.
Refer to the docs for further information: https://suites.dev/docs`;
}

export function referenceDependencyNotFoundError(
  identifier: Type | string | symbol,
  metadata: IdentifierMetadata | undefined
): string {
  const identifierName =
    typeof identifier === 'string' || typeof identifier === 'symbol'
      ? String(identifier)
      : identifier.name;
  const metadataMsg = metadata ? `, with metadata ${JSON.stringify(metadata)}` : '';
  const details = `'${identifierName}'${metadataMsg}`;

  return `The dependency associated with the specified token or identifier (${details}) could not be located within
the current testing context. This issue pertains to the usage of the UnitReference API.
Please ensure accurate spelling and correspondence between the provided token or identifier and the corresponding
injection configuration. If you are utilizing a custom token, it is essential to confirm its proper registration
within the DI container.

Refer to the docs for further information: https://suites.dev/docs`;
}
