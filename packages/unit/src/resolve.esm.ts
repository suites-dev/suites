/**
 * This module provides a function to resolve a path to a package.
 * It relies on the build system to provide the correct resolve module.
 * @module
 */

export function resolve(path: string): string {
  // @ts-expect-error - import.meta.resolve is not available in all contexts
  return import.meta.resolve(path);
}
