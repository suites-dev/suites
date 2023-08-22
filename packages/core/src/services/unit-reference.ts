import { StubbedInstance, Type } from '@automock/types';
import { ConstantValue, IdentifierMetadata, InjectableIdentifier } from '@automock/common';
import { MocksContainer } from './mocks-container';
import { InvalidIdentifierError } from '../types';

/**
 * Provides a reference to mock objects that have been mocked for testing
 * purposes within the test environment.
 *
 * The actual implementation of `StubbedInstance` may differ depending on the
 * testing-framework package used
 *
 * @see https://automock.dev/api-reference/api/unitreference-api
 */
export interface UnitReference {
  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to its type identifier.
   *
   * @since 2.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param type The type representing the dependency.
   * @returns The mocked object corresponding to the provided type identifier.
   */
  get<TDependency>(type: Type<TDependency>): StubbedInstance<TDependency>;

  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to a string-based token.
   *
   * @since 2.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param token The string-based token representing the dependency.
   * @returns The mocked object corresponding to the provided string-based token.
   */
  get<TDependency>(token: string): StubbedInstance<TDependency>;

  /**
   * Retrieves a reference to the mocked object of a dependency corresponding to a symbol-based token.
   *
   * @since 2.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @param token The symbol-based token representing the dependency.
   * @returns The mocked object corresponding to the provided symbol-based token.
   */
  get<TDependency>(token: symbol): StubbedInstance<TDependency>;

  /**
   * Retrieves a constant value corresponding to a string-based token.
   *
   * @since 2.0.0
   * @template TValue The type of the constant value being retrieved.
   * @param token The string-based token representing the constant value.
   * @returns The constant value corresponding to the provided string-based token.
   */
  get<TValue extends ConstantValue>(token: string): TValue;

  /**
   * Retrieves a constant value corresponding to a symbol-based token.
   *
   * @since 2.0.0
   * @template TValue The type of the constant value being retrieved.
   * @param token The symbol-based token representing the constant value.
   * @returns The constant value corresponding to the provided symbol-based token.
   */
  get<TValue extends ConstantValue>(token: symbol): TValue;

  /**
   * Retrieves a mocked object or a constant value of a dependency using its type, string, or symbol token.
   *
   * This method provides flexibility in retrieving dependencies by allowing various identifier types.
   * Depending on the identifier and the setup, it can return either a mocked object or a constant value.
   *
   * @since 2.0.0
   * @template TDependency The type of the dependency being retrieved.
   * @template TValue The type of the constant value that might be returned.
   * @param identifier The token representing the dependency. It can be of type `Type<TDependency>`, `string`, or `symbol`.
   * @returns The mocked instance or constant value corresponding to the provided identifier.
   */
  get<TDependency, TValue extends ConstantValue>(
    identifier: Type<TDependency> | string | symbol
  ): StubbedInstance<TDependency> | TValue;
}

export class UnitReference {
  public constructor(private readonly mocksContainer: MocksContainer) {}

  public get<TDependency>(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): StubbedInstance<TDependency> | ConstantValue {
    const dependency = this.mocksContainer.resolve<TDependency>(identifier, metadata);

    if (!dependency) {
      const message = referenceDependencyNotFoundError(identifier, metadata);
      throw new InvalidIdentifierError(message);
    }

    return dependency;
  }
}

function referenceDependencyNotFoundError(
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

Refer to the docs for further information: https://autmock.dev/docs`;
}
