import type { IdentifierMetadata, InjectableIdentifier } from '@suites/types.di';

export function stringifyIdentifier(
  identifier: InjectableIdentifier,
  metadata: IdentifierMetadata | undefined
): string {
  const identifierName =
    typeof identifier === 'string' || typeof identifier === 'symbol'
      ? String(identifier)
      : identifier.name;

  const metadataMsg = metadata ? `, with metadata ${JSON.stringify(metadata)}` : '';
  return `'${identifierName}'${metadataMsg}`;
}

export function referenceDependencyNotFoundError(
  identifier: InjectableIdentifier,
  metadata: IdentifierMetadata | undefined
): string {
  const details = stringifyIdentifier(identifier, metadata);

  return `The dependency identified by '${details}' could not be located within the current testing context.
This error usually occurs when attempting to access a dependency that has not been mocked or exposed
during the test setup. Please verify that '${details}' is correctly mocked or explicitly exposed in the
TestBed configuration if it is essential for your tests.
Review your testing setup to ensure all required dependencies are correctly included and configured.
For detailed setup instructions and troubleshooting, please visit: https://suites.dev/docs.`;
}
