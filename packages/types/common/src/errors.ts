/**
 * Error codes used throughout the Suites framework to identify specific error conditions.
 * Each code corresponds to a specific error type and helps with debugging and error handling.
 *
 * @since 3.0.0
 * @see https://suites.dev/docs
 *
 * @example
 * ```
 * import { SuitesErrorCode } from '@suites/types.common';
 *
 * // Check for specific error code
 * if (error.code === SuitesErrorCode.IDENTIFIER_NOT_FOUND) {
 *   // Handle identifier not found error
 * }
 * ```
 */
export const SuitesErrorCode = {
  /** Identifier not found in dependency container (ER010) */
  IDENTIFIER_NOT_FOUND: 'ER010',
  /** DI adapter not found or not configured (ER020) */
  ADAPTER_NOT_FOUND: 'ER020',
  /** Error occurred within DI adapter (ER021) */
  ADAPTER_ERROR: 'ER021',
  /** Dependency type could not be detected from metadata (ER30) */
  UNDEFINED_DEPENDENCY: 'ER30',
  /** Token type could not be detected (ER31) */
  UNDEFINED_TOKEN: 'ER31',
  /** Dependency could not be resolved from container (ER040) */
  DEPENDENCY_RESOLUTION_ERROR: 'ER040',
};

/**
 * Type representing all possible Suites error codes.
 *
 * @since 3.0.0
 */
export type SuitesErrorCode = (typeof SuitesErrorCode)[keyof typeof SuitesErrorCode];

/**
 * Base error class for all Suites framework errors. All specific error types extend this class,
 * providing a consistent error structure with error codes for identification and debugging.
 *
 * This error includes a code property that can be used to programmatically identify the error type,
 * making it easier to handle specific errors in application code.
 *
 * @since 3.0.0
 */
export class SuitesError extends Error {
  public constructor(
    public readonly code: SuitesErrorCode,
    title: string,
    message: string
  ) {
    super(`${title} (code ${code.toString()})\n${message}`);
    this.name = 'SuitesError';
  }
}

/**
 * Thrown when a dependency cannot be retrieved from the dependency container.
 *
 * This occurs when calling `unitRef.get()` with an identifier that doesn't exist in the test environment,
 * typically because the dependency was not mocked or exposed.
 *
 * @since 3.0.0
 * @see https://suites.dev/docs
 */
export class DependencyResolutionError extends SuitesError {
  public constructor(message: string) {
    super(SuitesErrorCode.DEPENDENCY_RESOLUTION_ERROR, 'Dependency resolution error', message);
    this.name = 'DependencyResolutionError';
  }
}
