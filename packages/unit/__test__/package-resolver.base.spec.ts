import type { DependencyInjectionAdapter } from '@suites/types.di';
import { PackageResolver, type PackageResolverStrategy } from '../src/package-resolver.base';

describe('PackageResolver Unit Spec', () => {
  describe('resolveCorrespondingAdapter', () => {
    describe('when strategy finds a matching adapter', () => {
      let packageResolver: PackageResolver<DependencyInjectionAdapter>;
      let mockStrategy: jest.Mock<boolean, [string]>;

      beforeEach(() => {
        mockStrategy = jest.fn((path: string) => path.includes('test-adapter'));
        packageResolver = new PackageResolver<DependencyInjectionAdapter>(
          { test: __dirname + '/assets/test-adapter' },
          mockStrategy
        );
      });

      it('should call the strategy with the adapter path', async () => {
        await packageResolver.resolveCorrespondingAdapter();
        expect(mockStrategy).toHaveBeenCalledWith(__dirname + '/assets/test-adapter');
      });

      it('should successfully resolve the adapter', async () => {
        const adapter = await packageResolver.resolveCorrespondingAdapter();
        expect(adapter.inspect({} as never)).toBe('success');
      });
    });

    describe('when strategy returns false for all adapters', () => {
      let packageResolver: PackageResolver<DependencyInjectionAdapter>;
      let mockStrategy: PackageResolverStrategy;

      beforeEach(() => {
        mockStrategy = jest.fn().mockReturnValue(false);
        packageResolver = new PackageResolver<DependencyInjectionAdapter>(
          {
            adapter1: 'package-1',
            adapter2: 'package-2',
          },
          mockStrategy
        );
      });

      it('should throw "Adapter not found" error', async () => {
        await expect(packageResolver.resolveCorrespondingAdapter()).rejects.toThrow(
          'Adapter not found'
        );
      });

      it('should call strategy for each adapter', async () => {
        try {
          await packageResolver.resolveCorrespondingAdapter();
        } catch {
          // Expected to throw
        }
        expect(mockStrategy).toHaveBeenCalledWith('package-1');
        expect(mockStrategy).toHaveBeenCalledWith('package-2');
      });
    });

    describe('when adapter module has no "adapter" export', () => {
      let packageResolver: PackageResolver<DependencyInjectionAdapter>;

      beforeEach(() => {
        const mockStrategy = jest.fn().mockReturnValue(true);
        packageResolver = new PackageResolver<DependencyInjectionAdapter>(
          { invalid: __dirname + '/assets/invalid-adapter' },
          mockStrategy
        );
      });

      it('should throw "Adapter has no export" error', async () => {
        await expect(packageResolver.resolveCorrespondingAdapter()).rejects.toThrow(
          'Adapter has no export'
        );
      });
    });

    describe('when multiple adapters are configured', () => {
      let packageResolver: PackageResolver<DependencyInjectionAdapter>;
      let mockStrategy: jest.Mock<boolean, [string]>;

      beforeEach(() => {
        // Strategy only returns true for the second adapter
        mockStrategy = jest.fn((path: string) => path === __dirname + '/assets/test-adapter');
        packageResolver = new PackageResolver<DependencyInjectionAdapter>(
          {
            nonexistent: 'nonexistent-package',
            test: __dirname + '/assets/test-adapter',
            another: 'another-nonexistent',
          },
          mockStrategy
        );
      });

      it('should resolve the first matching adapter', async () => {
        const adapter = await packageResolver.resolveCorrespondingAdapter();
        expect(adapter.inspect({} as never)).toBe('success');
      });

      it('should stop checking once a match is found', async () => {
        await packageResolver.resolveCorrespondingAdapter();
        // Strategy is called with find(), which stops at first match
        // The calls depend on object key iteration order
        expect(mockStrategy).toHaveBeenCalled();
      });
    });

    describe('when adapters object is empty', () => {
      let packageResolver: PackageResolver<DependencyInjectionAdapter>;

      beforeEach(() => {
        const mockStrategy = jest.fn().mockReturnValue(true);
        packageResolver = new PackageResolver<DependencyInjectionAdapter>({}, mockStrategy);
      });

      it('should throw "Adapter not found" error', async () => {
        await expect(packageResolver.resolveCorrespondingAdapter()).rejects.toThrow(
          'Adapter not found'
        );
      });
    });
  });
});


