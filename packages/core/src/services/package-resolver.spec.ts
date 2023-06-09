import { PackageResolver } from './package-resolver';

const ReflectorsMock: Record<string, string> = {
  first: 'first-reflector',
  second: 'second-reflector',
  third: 'third-reflector',
} as const;

describe('Package Resolving Unit Spec', () => {
  const requireMock = { resolve: jest.fn(), require: jest.fn() };

  let underTest: PackageResolver;

  beforeAll(() => {
    underTest = new PackageResolver(ReflectorsMock, requireMock);
  });

  test('require, and return the module if the a resolver was found', () => {
    requireMock.resolve.mockReturnValue('valid');
    requireMock.require.mockReturnValue('IS_A_VALID_MODULE');
    const reflector = underTest.resolveCorrespondingAdapter();

    expect(requireMock.require).toHaveBeenCalledWith('first-reflector');
    expect(reflector).toBe('IS_A_VALID_MODULE');
  });

  test('throw an error if no resolver was found at all', () => {
    requireMock.require.mockReset();

    requireMock.resolve.mockImplementation(() => {
      throw new Error('Cant Resolve Error');
    });

    requireMock.require.mockReturnValue('IS_A_VALID_MODULE');
    expect(() => underTest.resolveCorrespondingAdapter()).toThrow();
    expect(requireMock.require).not.toHaveBeenCalled();
  });
});
