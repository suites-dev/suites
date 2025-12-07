import type { DependencyInjectionAdapter } from '@suites/types.di';
import { PackageResolver } from '../src/package-resolver';

describe('PackageResolver Unit Spec', () => {
  describe('resolveCorrespondingAdapter', () => {
    describe('when a matching adapter is found', () => {
      let packageResolver: PackageResolver<DependencyInjectionAdapter>;

      beforeEach(() => {
        packageResolver = new PackageResolver<DependencyInjectionAdapter>({
          test: __dirname + '/assets/test-adapter',
        });
      });

      it('should successfully resolve the adapter', async () => {
        const adapter = await packageResolver.resolveCorrespondingAdapter();
        expect(adapter.inspect({} as never)).toBe('success');
      });
    });

    describe('when no adapters can be resolved', () => {
      let packageResolver: PackageResolver<DependencyInjectionAdapter>;

      beforeEach(() => {
        packageResolver = new PackageResolver<DependencyInjectionAdapter>({
          adapter1: 'package-1',
          adapter2: 'package-2',
        });
      });

      it('should throw "Adapter not found" error', async () => {
        await expect(packageResolver.resolveCorrespondingAdapter()).rejects.toThrow(
          'Adapter not found'
        );
      });
    });

    describe('when adapter module has no "adapter" export', () => {
      let packageResolver: PackageResolver<DependencyInjectionAdapter>;

      beforeEach(() => {
        packageResolver = new PackageResolver<DependencyInjectionAdapter>({
          invalid: __dirname + '/assets/invalid-adapter',
        });
      });

      it('should throw "Adapter has no export" error', async () => {
        await expect(packageResolver.resolveCorrespondingAdapter()).rejects.toThrow(
          'Adapter has no export'
        );
      });
    });

    describe('when multiple adapters are configured', () => {
      let packageResolver: PackageResolver<DependencyInjectionAdapter>;

      beforeEach(() => {
        packageResolver = new PackageResolver<DependencyInjectionAdapter>({
          nonexistent: 'nonexistent-package',
          test: __dirname + '/assets/test-adapter',
          another: 'another-nonexistent',
        });
      });

      it('should resolve the first matching adapter', async () => {
        const adapter = await packageResolver.resolveCorrespondingAdapter();
        expect(adapter.inspect({} as never)).toBe('success');
      });
    });

    describe('when adapters object is empty', () => {
      let packageResolver: PackageResolver<DependencyInjectionAdapter>;

      beforeEach(() => {
        packageResolver = new PackageResolver<DependencyInjectionAdapter>({});
      });

      it('should throw "Adapter not found" error', async () => {
        await expect(packageResolver.resolveCorrespondingAdapter()).rejects.toThrow(
          'Adapter not found'
        );
      });
    });
  });
});
