import type { MaybeMockedDeep, Mock, Mocked as VitestMocked } from '@vitest/spy';

type MockFunction<T extends (...args: any[]) => any> = VitestMocked<ReturnType<T>> & T;

type MockedProperty<T> = T extends (...args: any[]) => any ? MockFunction<T> : Mocked<T>;

/**
 * Represents a fully mocked instance where all properties and methods are Vitest mocks.
 *
 * This type transforms any object type into a mocked version where:
 * - All methods become `vi.Mocked` instances with full Vitest API support
 * - All properties can be accessed and will return mocked values
 * - Nested objects are recursively mocked
 * - Type safety is preserved throughout the mock hierarchy
 *
 * @template T The type of the object being mocked
 *
 * @remarks
 * When `@suites/doubles.vitest` is installed, this type augments the base
 * `Mocked<T>` type from `@suites/unit` with Vitest-specific functionality.
 * All mocked methods support Vitest's mock API including `mockReturnValue`,
 * `mockResolvedValue`, `mockImplementation`, and assertion matchers.
 *
 * @since 3.0.0
 * @see {@link https://vitest.dev/api/vi.html#vi-fn | Vitest Mock API}
 * @see {@link https://suites.dev/docs/api-reference/types | Type Reference}
 */
export type Mocked<T> = MaybeMockedDeep<T> & {
  [K in keyof T]: MockedProperty<T[K]>;
};

/**
 * Represents a Vitest mock function that can stub behavior and track calls.
 *
 * This type represents a `vi.fn()` function with full mocking capabilities including:
 * - Configurable return values and implementations
 * - Call tracking and assertion support
 * - Async behavior mocking (promises)
 * - Type-safe arguments and return values
 *
 * @template TArgs The tuple type of the function's arguments
 *
 * @remarks
 * When `@suites/doubles.vitest` is installed, this type augments the base
 * `Stub` type from `@suites/unit` with Vitest's mock function capabilities.
 * It's the fundamental building block for all function mocking in Vitest.
 *
 *
 * @since 3.0.0
 * @see {@link https://vitest.dev/api/vi.html#vi-fn | Vitest Function Mocks}
 * @see {@link https://suites.dev/docs/api-reference/mock | Stub Reference}
 */
export type Stub<TArgs extends any[] = any[], TReturn = any> = Mock<TArgs, TReturn>;
