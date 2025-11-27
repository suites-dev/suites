import type { DependencyInjectionAdapter } from '@suites/types.di';
import { PackageResolver } from '../src/package-resolver';
import { SuitesDIAdapters, SuitesDoublesAdapters } from '../src/testbed-builder';

describe('Suites Adapter Package Resolving Integration Test', () => {
  describe('DI Adapters Registry', () => {
    it('should include all supported DI adapters', () => {
      const adapters = Object.keys(SuitesDIAdapters);
      expect(adapters).toContain('nestjs');
      expect(adapters).toContain('inversify');
      expect(adapters).toContain('tsyringe');
      expect(adapters).toContain('injectionjs');
    });

    it('should include all supported doubles adapters', () => {
      const adapters = Object.keys(SuitesDoublesAdapters);
      expect(adapters).toContain('jest');
      expect(adapters).toContain('sinon');
      expect(adapters).toContain('vitest');
    });
  });

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
