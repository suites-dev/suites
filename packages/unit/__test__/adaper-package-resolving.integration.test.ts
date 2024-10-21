import type { DependencyInjectionAdapter } from '@suites/types.di';
import { PackageResolver } from '../src/package-resolver';

describe('Suites Adapter Package Resolving Integration Test', () => {
  let packageResolver: PackageResolver<DependencyInjectionAdapter>;

  describe('Resolving an adapter with default export', () => {
    beforeAll(() => {
      packageResolver = new PackageResolver({ test: __dirname + '/assets/test-adapter' });
    });

    it('should successfully resolve the adapter package', async () => {
      const diAdapter = await packageResolver.resolveCorrespondingAdapter();
      expect(diAdapter.inspect({} as never)).toBe('success');
    });
  });

  describe('Resolving an adapter with no default export', () => {
    beforeAll(() => {
      packageResolver = new PackageResolver({ test: __dirname + '/assets/invalid-adapter' });
    });

    it('should failed resolving the adapter package and throw an error', async () => {
      await expect(() => packageResolver.resolveCorrespondingAdapter()).rejects.toThrow(
        new Error('Adapter has no export')
      );
    });
  });
});
