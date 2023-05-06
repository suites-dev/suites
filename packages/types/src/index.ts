export type ArgsType<T> = T extends (...args: infer A) => any ? A : never;

export type DeepPartial<Type> = {
  [Prop in keyof Type]?: Type[Prop] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : Type[Prop] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : unknown extends Type[Prop]
    ? Type[Prop]
    : DeepPartial<Type[Prop]>;
};

export interface Type<T = any> {
  new (...args: any[]): T;
}

export type Callable = (...args: any[]) => any;
