import type { ConstantValue, Type } from '@suites/types.common';
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

export function mockDependencyNotFoundMessage(
  identifier: InjectableIdentifier,
  targetClass: Type
): string {
  const identifierName =
    typeof identifier === 'string' || typeof identifier === 'symbol'
      ? String(identifier)
      : identifier.name;

  return `Suites Warning: Redundant Mock Configuration Detected.
You attempted to configure a mock for '${identifierName}' which is not a dependency of the unit under test ('${targetClass.name}'),
and does not directly interact with any of its dependencies. Since this test is conducted in a solitary context, only dependencies
directly associated with '${targetClass.name}' should be mocked.
This mock configuration will not influence the outcome of your test and can be safely removed unless there's an oversight in
identifying '${identifierName}' as irrelevant.
If '${identifierName}' should interact with the unit, please verify the implementation of '${targetClass.name}' and adjust your test
setup accordingly. For more detailed guidance on setting up solitary tests, please visit: https://suites.dev/docs.
  `;
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

  return `The dependency identified by ${details} could not be found within the testing context.
This error typically indicates an attempt to access a dependency that was neither mocked nor exposed during the test setup.
Please ensure that '${details}' is correctly mocked or exposed in the TestBed configuration if it is required for your tests.
Review your testing setup to confirm that all necessary dependencies are included and properly configured. For detailed setup instructions and troubleshooting, visit: https://suites.dev/docs.
`;
}

export function exposedDependencyRetrievalError(
  identifier: InjectableIdentifier,
  metadata: IdentifierMetadata | undefined
): string {
  const identifierName =
    typeof identifier === 'string' || typeof identifier === 'symbol'
      ? String(identifier)
      : identifier.name;
  const metadataMsg = metadata ? `, with metadata ${JSON.stringify(metadata)}` : '';
  const details = `'${identifierName}'${metadataMsg}`;

  return `The dependency associated with the specified token or identifier ${details} could not be retrieved from the
current testing context, as it is marked as an exposed dependency. Exposed dependencies are not intended for direct
retrieval and should be accessed through the appropriate testing context or container.
Refer to the docs for further information: https://suites.dev/docs\`;
  `;
}
