import type { SinonStub } from 'sinon';

type MockFunction<T extends (...args: any[]) => any> = SinonStub<Parameters<T>, ReturnType<T>> & T;

type MockedProperty<T> = T extends (...args: any[]) => any ? MockFunction<T> : Mocked<T>;

/**
 * Represents a fully mocked instance where all properties and methods are Sinon stubs.
 *
 * This type transforms any object type into a mocked version where:
 * - All methods become `sinon.stub` instances with full Sinon API support
 * - All properties can be accessed and will return mocked values
 * - Nested objects are recursively mocked
 * - Type safety is preserved throughout the mock hierarchy
 *
 * @template T The type of the object being mocked
 *
 * @remarks
 * When `@suites/doubles.sinon` is installed, this type augments the base
 * `Mocked<T>` type from `@suites/unit` with Sinon-specific functionality.
 * All mocked methods support Sinon's stub API including `returns`,
 * `resolves`, `rejects`, `throws`, and assertion capabilities.
 *
 * @example
 * ```ts
 * import type { Mocked } from '@suites/unit';
 * import { TestBed } from '@suites/unit';
 *
 * class UserRepository {
 *   public findById(id: string): Promise<User> { ... }
 *   public save(user: User): Promise<void> { ... }
 * }
 *
 * const { unit, unitRef } = await TestBed.solitary(UserService).compile();
 * const mockRepo: Mocked<UserRepository> = unitRef.get(UserRepository);
 *
 * // Full Sinon API available
 * mockRepo.findById.resolves({ id: '1', name: 'Alice' });
 * expect(mockRepo.save.calledWith(sinon.match({ name: 'Alice' }))).toBe(true);
 * ```
 *
 * @since 3.0.0
 * @see {@link https://sinonjs.org/releases/latest/stubs/ | Sinon Stubs}
 * @see {@link https://suites.dev/docs/api-reference/types | Type Reference}
 */
export type Mocked<T> = {
  [Key in keyof T]: MockedProperty<T[Key]>;
};

/**
 * Represents a Sinon stub function that can stub behavior and track calls.
 *
 * This type represents a `sinon.stub()` function with full stubbing capabilities including:
 * - Configurable return values and behaviors
 * - Call tracking and assertion support
 * - Async behavior stubbing (promises)
 * - Type-safe arguments and return values
 *
 * @template TArgs The tuple type of the function's arguments
 *
 * @remarks
 * When `@suites/doubles.sinon` is installed, this type augments the base
 * `Stub` type from `@suites/unit` with Sinon's stub function capabilities.
 * It's the fundamental building block for all function stubbing in Sinon.
 *
 *
 * @since 3.0.0
 * @see {@link https://sinonjs.org/releases/latest/stubs/ | Sinon Stubs}
 * @see {@link https://suites.dev/docs/api-reference/mock | Stub Reference}
 */
export type Stub<TArgs extends any[] = any[], TReturn = any> = SinonStub<TArgs, TReturn>;
