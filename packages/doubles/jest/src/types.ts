type MockFunction<T extends (...args: any[]) => any> = jest.Mock<ReturnType<T>, Parameters<T>> & T;

type MockedProperty<T> = T extends (...args: any[]) => any ? MockFunction<T> : Mocked<T>;

/**
 * Represents a fully mocked instance where all properties and methods are Jest mocks.
 *
 * This type transforms any object type into a mocked version where:
 * - All methods become `jest.Mocked` instances with full Jest API support
 * - All properties can be accessed and will return mocked values
 * - Nested objects are recursively mocked
 * - Type safety is preserved throughout the mock hierarchy
 *
 * @template T The type of the object being mocked
 *
 * @remarks
 * When `@suites/doubles.jest` is installed, this type augments the base
 * `Mocked<T>` type from `@suites/unit` with Jest-specific functionality.
 * All mocked methods support Jest's mock API including `mockReturnValue`,
 * `mockResolvedValue`, `mockImplementation`, and assertion matchers.
 *
 * @example
 * import type { Mocked } from '@suites/unit';
 * import { TestBed } from '@suites/unit';
 *
 * class UserRepository {
 *   public findById(id: string): Promise<User> { ... }
 *   public save(user: User): Promise<void> { ... }
 * }
 *
 * const { unit, unitRef } = await TestBed.solitary(UserService).compile();
 * const mockRepo = unitRef.get(UserRepository);
 *
 * // Full Jest API available
 * mockRepo.findById.mockResolvedValue({ id: '1', name: 'Alice' });
 * expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alice' }));
 *
 * @since 3.0.0
 * @see {@link https://jestjs.io/docs/mock-function-api Jest Mock API}
 * @see {@link https://suites.dev/docs/api-reference/types Type Reference}
 */
export type Mocked<T> = {
  [Key in keyof T]: MockedProperty<T[Key]>;
};

/**
 * Represents a Jest mock function that can stub behavior and track calls.
 *
 * This type represents a `jest.Mock` function with full mocking capabilities including:
 * - Configurable return values and implementations
 * - Call tracking and assertion support
 * - Async behavior mocking (promises)
 * - Type-safe arguments and return values
 *
 * @template TArgs The tuple type of the function's arguments
 *
 * @remarks
 * When `@suites/doubles.jest` is installed, this type augments the base
 * `Stub` type from `@suites/unit` with Jest's mock function capabilities.
 * It's the fundamental building block for all function mocking in Jest.
 *
 *
 * @since 3.0.0
 * @see {@link https://jestjs.io/docs/mock-function-api#jestfnimplementation Jest Function Mocks}
 * @see {@link https://suites.dev/docs/api-reference/mock Stub Reference}
 */
export type Stub<TArgs extends any[] = any[]> = jest.Mock<any, TArgs>;
