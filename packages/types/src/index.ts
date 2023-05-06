export interface Type<T = any> {
  new (...args: any[]): T;
}

export type DeepPartial<Type> = {
  [Prop in keyof Type]?: Type[Prop] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : Type[Prop] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : unknown extends Type[Prop]
    ? Type[Prop]
    : DeepPartial<Type[Prop]>;
};

export type ArgsType<T> = T extends (...args: infer A) => any ? A : never;

export type Callable = (...args: any[]) => any;

export type Stubbable<TType> = Callable | TType;

type Stub<ReturnType, Args extends any[]> = {
  (...args: Args): ReturnType;
};

type StubbedMember<T> = T extends (...args: infer Args) => infer ReturnValue
  ? Stub<ReturnValue, ArgsType<T>>
  : T;

export type StubbedInstance<TClass> = TClass & {
  [Prop in keyof TClass]: StubbedMember<TClass[Prop]>;
};

export type MockFunction<TType> = (implementation?: Stubbable<TType>) => StubbedInstance<TType>;
