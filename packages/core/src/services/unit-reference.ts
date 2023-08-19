import { StubbedInstance, Type } from '@automock/types';
import { ConstantValue, IdentifierMetadata, InjectableIdentifier } from '@automock/common';
import { MocksContainer } from './mocks-container';
import { InvalidIdentifierError } from '../types';

/**
 * Represents a reference to the mocked object based on the provided type or token.
 */
export interface UnitReference {
  /**
   * Returns a reference to the mocked object based on the provided class type.
   *
   * @param identifier - The type of the dependency.
   * @returns The mocked instance of the dependency.
   * @template TDependency - The type of the dependency.
   */
  get<TDependency>(identifier: Type<TDependency>): StubbedInstance<TDependency>;

  /**
   * Returns a reference to the mocked object based on the provided string token.
   *
   * @param identifier - The string-based token of the dependency.
   * @returns The mocked instance of the dependency.
   * @template TDependency - The type of the dependency.
   */
  get<TDependency>(identifier: string): StubbedInstance<TDependency>;

  /**
   * Returns a reference to the mocked object based on the provided symbol token.
   *
   * @param identifier - The symbol-based token of the dependency.
   * @returns The mocked instance of the dependency.
   * @template TDependency - The type of the dependency.
   */
  get<TDependency>(identifier: symbol): StubbedInstance<TDependency>;

  /**
   * Returns a constant value based on the provided string token.
   *
   * @param identifier - The string-based token of the dependency.
   * @template TValue - The type of constant value.
   * @returns The constant value.
   */
  get<TValue extends ConstantValue>(identifier: string): TValue;

  /**
   * Returns a constant value based on the provided symbol token.
   *
   * @param identifier - The string-based token of the dependency.
   * @template TValue - The type of constant value.
   * @returns The constant value.
   */
  get<TValue extends ConstantValue>(identifier: symbol): TValue;

  /**
   * Returns a reference or to the mocked object or a constant value
   * based on the provided token or class type.
   *
   * @param identifier - The type or token of the dependency.
   * @returns The mocked instance of the dependency or the constant value.
   * @template TDependency - The type of the dependency.
   * @template TValue - The type of constant value.
   */
  get<TDependency, TValue extends ConstantValue>(
    identifier: Type<TDependency> | string | symbol
  ): StubbedInstance<TDependency> | TValue;
}

export class UnitReference {
  public constructor(private readonly mocksContainer: MocksContainer) {}

  public get<TDependency>(identifier: Type<TDependency>): StubbedInstance<TDependency>;
  public get<TDependency>(identifier: string): StubbedInstance<TDependency>;
  public get<TDependency>(identifier: symbol): StubbedInstance<TDependency>;
  public get<TValue extends ConstantValue>(identifier: symbol): TValue;
  public get<TValue extends ConstantValue>(identifier: string): TValue;
  public get<TValue extends ConstantValue>(
    identifier: symbol,
    metadata: IdentifierMetadata
  ): TValue;
  public get<TValue extends ConstantValue>(
    identifier: string,
    metadata: IdentifierMetadata
  ): TValue;
  public get<TDependency>(
    identifier: InjectableIdentifier,
    metadata?: IdentifierMetadata
  ): StubbedInstance<TDependency> | ConstantValue {
    const dependency = this.mocksContainer.resolve<TDependency>(identifier, metadata);

    if (!dependency) {
      throw referenceDependencyNotFoundError(identifier, metadata);
    }

    return dependency;
  }
}

function referenceDependencyNotFoundError(
  identifier: Type | string | symbol,
  metadata: IdentifierMetadata | undefined
): Error {
  const identifierName =
    typeof identifier === 'string' || typeof identifier === 'symbol'
      ? String(identifier)
      : identifier.name;
  const metadataMsg = metadata ? `, with metadata ${JSON.stringify(metadata)}` : '';
  const details = `'${identifierName}'${metadataMsg}`;

  return new InvalidIdentifierError(
    `The dependency associated with the specified token or identifier (${details}) could not be located within the current testing context.
This issue pertains to the usage of the UnitReference API. Please ensure accurate spelling and correspondence between the provided token or identifier and the corresponding injection configuration.
Refer to the docs for further information: https://autmock.dev/docs`
  );
}
