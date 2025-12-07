/**
 * This module provides a function to resolve a path to a package.
 * It relies on the build system to provide the correct resolve module.
 * @module
 */

export function resolve(path: string): string {
  return require.resolve(path);
}
