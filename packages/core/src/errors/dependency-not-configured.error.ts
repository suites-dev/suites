import type { Type } from '@suites/types.common';

/**
 * Error thrown when a dependency is accessed but not configured in the test.
 * Contains metadata for generating user-friendly error messages.
 *
 * @since 4.0.0
 */
export class DependencyNotConfiguredError extends Error {
  public readonly name = 'DependencyNotConfiguredError';

  constructor(
    public readonly identifier: string,
    public readonly mode: 'expose' | 'boundaries' | null,
    public readonly configuredExposes: readonly Type[],
    public readonly configuredBoundaries: readonly Type[]
  ) {
    super(`Dependency '${identifier}' was not configured`);
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DependencyNotConfiguredError);
    }
  }
}
