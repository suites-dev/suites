import { SuitesError, SuitesErrorCode } from '@suites/types.common';

/**
 * Thrown when attempting to retrieve a dependency identifier that does not exist in the test environment.
 *
 * This typically occurs when using `unitRef.get()` to access a dependency that was never mocked or exposed.
 *
 * @since 3.0.0
 * @see https://suites.dev/docs
 *
 * @example
 * // Fix by mocking the dependency
 * const { unit, unitRef } = await TestBed.solitary(MyService)
 *   .mock(SomeDependency)
 *   .impl(() => ({ method: jest.fn() }))
 *   .compile();
 */
export class IdentifierNotFoundError extends SuitesError {
  public constructor(message: string) {
    super(SuitesErrorCode.IDENTIFIER_NOT_FOUND, 'Missing class dependency identifier', message);
    this.name = 'IdentifierNotFoundError';
  }
}

/**
 * Thrown when Suites cannot detect the type or token for a dependency during class reflection.
 *
 * This occurs when TypeScript metadata is missing or incomplete, typically because:
 * - `emitDecoratorMetadata` is not enabled in tsconfig.json
 * - A dependency is not decorated or has circular references
 * - Using interface types instead of concrete classes for injection
 *
 * @since 3.0.0
 * @see https://suites.dev/docs
 */
export class UndefinedDependencyError extends SuitesError {
  public constructor(message: string) {
    super(SuitesErrorCode.UNDEFINED_DEPENDENCY, 'Undefined dependency identifier', message);
    this.name = 'UndefinedDependencyError';
  }
}

/**
 * Thrown when a token type cannot be detected during dependency injection setup.
 *
 * This is similar to `UndefinedDependencyError` but specifically for token-based dependencies.
 *
 * @since 3.0.0
 * @see https://suites.dev/docs
 */
export class UndefinedTokenError extends SuitesError {
  public constructor(message: string) {
    super(SuitesErrorCode.UNDEFINED_DEPENDENCY, 'Undefined token', message);
    this.name = 'UndefinedTokenError';
  }
}
