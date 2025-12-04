/**
 * Represents a class constructor type that can be instantiated with `new`.
 * This type is used throughout Suites to represent injectable classes and dependencies.
 *
 * @template T The type of instance the constructor creates
 * @since 3.0.0
 */
export interface Type<T = any> {
  new (...args: any[]): T;
}

/**
 * Represents primitive or simple constant values that can be injected as dependencies.
 *
 * @since 3.0.0
 */
export type ConstantValue = unknown[] | string | number | boolean | symbol | null;

/**
 * Utility type that makes all properties of a type optional recursively.
 *
 * Used extensively in mocking to allow partial implementations of dependencies,
 * where you only need to define the methods/properties.
 *
 * @template Type The type to make deeply partial
 * @since 3.0.0
 */
export type DeepPartial<Type> = {
  [Prop in keyof Type]?: unknown extends Type[Prop] ? Type[Prop] : DeepPartial<Type[Prop]>;
};

/**
 * Represents either a constant value or a partial object implementation.
 *
 * Used when providing mock implementations that can be either simple values
 * or partial object structures.
 *
 * @template T The type of the value when using partial objects
 * @since 3.0.0
 */
export type FinalValue<T = unknown> = ConstantValue | DeepPartial<T>;
