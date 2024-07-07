export interface Type<T = any> {
  new (...args: any[]): T;
}

export type ConstantValue = unknown[] | string | number | boolean | symbol | null;

export type DeepPartial<Type> = {
  [Prop in keyof Type]?: unknown extends Type[Prop] ? Type[Prop] : DeepPartial<Type[Prop]>;
};

export type FinalValue<T = unknown> = ConstantValue | DeepPartial<T>;
