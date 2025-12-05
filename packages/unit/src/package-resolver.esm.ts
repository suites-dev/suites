/**
 * ESM version of PackageResolver with import.meta.resolve strategy.
 * Pure IoC composition with factory function.
 * @module
 */

import type { DependencyInjectionAdapter } from '@suites/types.di';
import type { DoublesAdapter } from '@suites/types.doubles';
import { PackageResolver as BasePackageResolver } from './package-resolver.base';

/**
 * ESM package resolution strategy using import.meta.resolve
 * Falls back to require.resolve for special cases like Vitest
 */
function createEsmResolverStrategy(): (path: string) => boolean {
  return (path: string): boolean => {
    // In special cases like Vitest, we need to use the require function to resolve the path.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - import.meta may not exist in all contexts
    if (typeof import.meta.resolve !== 'function' && typeof require === 'function') {
      try {
        require.resolve(path);
        return true;
      } catch (error) {
        return false;
      }
    }
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - import.meta.resolve may not exist in all Node versions
      import.meta.resolve(path);
      return true;
    } catch {
      return false;
    }
  };
}

/**
 * Creates a PackageResolver instance with ESM resolution strategy
 */
export function createPackageResolver<TAdapter extends DependencyInjectionAdapter | DoublesAdapter>(
  adapters: Record<string, string>
): BasePackageResolver<TAdapter> {
  return new BasePackageResolver<TAdapter>(adapters, createEsmResolverStrategy());
}
