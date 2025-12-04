import type { DeepPartial } from '@suites/types.common';

export type ArgsType<T> = T extends (...args: infer A) => any ? A : any;

/**
 * Represents a stub function that can be configured to return specific values
 * and track how it was called during testing.
 *
 * This is the base abstraction for test doubles that replace functions.
 * Testing adapters augment this interface with their specific capabilities
 * such as call tracking, return value configuration, and behavior verification.
 *
 * @template ReturnType The type that the stub function returns
 * @template Args The tuple type of the function's arguments
 * @since 3.0.0
 */
export interface Stub<ReturnType, Args extends any[]> {
  (...args: Args): ReturnType;
}

export interface StubbedMember<T> {
  [key: string]: T extends (...args: any[]) => infer ReturnValue
    ? Stub<ReturnValue, ArgsType<T>>
    : StubbedMember<T>;
}

/**
 * Base implementation type for stubbed instances.
 *
 * This type recursively converts all members of a class or object into stubbed versions.
 * It serves as the foundation for the user-facing `Mocked<T>` type.
 *
 * @template TClass The type of the class or object being stubbed
 *
 * @remarks
 * This is an internal implementation type. The `Mocked<T>` type should be imported from
 * `@suites/unit` instead, which provides the same functionality with proper
 * adapter augmentation support.
 *
 * @example
 * // ❌ DO NOT use StubbedInstance directly
 * import { StubbedInstance } from '@suites/types.doubles';
 *
 * // ✅ Use Mocked instead
 * import { Mocked } from '@suites/unit';
 *
 * @since 3.0.0
 * @internal
 */
export type StubbedInstance<TClass> = {
  [Prop in keyof TClass]: StubbedMember<TClass[Prop]>;
};

export type MockFunction<TType = unknown> = (
  implementation?: DeepPartial<TType>
) => StubbedInstance<TType>;

export type DoublesAdapter<T = unknown> = {
  mock: MockFunction;
  stub: () => Stub<T, any[]>;
};
