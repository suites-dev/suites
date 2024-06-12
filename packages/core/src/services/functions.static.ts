import type { ConstantValue } from '@suites/types.common';
import type { IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';

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

export function referenceDependencyNotFoundError(
  identifier: InjectableIdentifier,
  metadata: IdentifierMetadata | undefined
): string {
  const identifierName =
    typeof identifier === 'string' || typeof identifier === 'symbol'
      ? String(identifier)
      : identifier.name;
  const metadataMsg = metadata ? `, with metadata ${JSON.stringify(metadata)}` : '';
  const details = `'${identifierName}'${metadataMsg}`;

  return `The dependency identified by '${details}' could not be located within the current testing context.
This error usually occurs when attempting to access a dependency that has not been mocked or exposed
during the test setup. Please verify that '${details}' is correctly mocked or explicitly exposed in the
TestBed configuration if it is essential for your tests.
Review your testing setup to ensure all required dependencies are correctly included and configured.
For detailed setup instructions and troubleshooting, please visit: https://suites.dev/docs.`;
}
