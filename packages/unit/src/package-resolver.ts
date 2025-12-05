/**
 * CJS version of PackageResolver with require.resolve strategy.
 * Pure IoC composition with factory function.
 * @module
 */

import type { DependencyInjectionAdapter } from '@suites/types.di';
import type { DoublesAdapter } from '@suites/types.doubles';
import {
  PackageResolver as BasePackageResolver,
  type PackageResolverStrategy,
} from './package-resolver.base';

/**
 * CJS package resolution strategy using require.resolve
 */
function createCjsResolverStrategy(): PackageResolverStrategy {
  return (path: string): boolean => {
    try {
      require.resolve(path);
      return true;
    } catch {
      return false;
    }
  };
}

/**
 * Creates a PackageResolver instance with CJS resolution strategy
 */
export function createPackageResolver<TAdapter extends DependencyInjectionAdapter | DoublesAdapter>(
  adapters: Record<string, string>
): BasePackageResolver<TAdapter> {
  return new BasePackageResolver<TAdapter>(adapters, createCjsResolverStrategy());
}
