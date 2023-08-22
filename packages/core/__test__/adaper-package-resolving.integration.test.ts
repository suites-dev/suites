import { PackageResolver } from '../src/services/package-resolver';

describe('Automock Adapter Package Resolving Integration Test', () => {
  let packageResolver: PackageResolver;

  describe('Resolving an adapter with default export', () => {
    beforeAll(() => {
      packageResolver = new PackageResolver(
        { test: './assets/test-adapter' },
        { resolve: require.resolve, require }
      );
    });

    it('should successfully resolve the adapter package', () => {
      const adapter = packageResolver.resolveCorrespondingAdapter();
      expect(adapter.reflect({} as never)).toBe('success');
    });
  });

  describe('Resolving an adapter with no default export', () => {
    beforeAll(() => {
      packageResolver = new PackageResolver(
        { test: './assets/invalid-adapter' },
        { resolve: require.resolve, require }
      );
    });

    it('should failed resolving the adapter package and throw an error', () => {
      expect(() => packageResolver.resolveCorrespondingAdapter()).toThrow(
        new Error('Adapter has no default export')
      );
    });
  });
});
