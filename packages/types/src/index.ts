export type DeepPartial<Type> = {
  [Key in keyof Type]?: Type[Key] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : Type[Key] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : unknown extends Type[Key]
    ? Type[Key]
    : DeepPartial<Type[Key]>;
};

export type FnPartialReturn<Type> = {
  [Key in keyof Type]?: Type[Key] extends (...args: infer Args) => infer U
    ? (...args: Args) => FnPartialReturn<U>
    : DeepPartial<Type[Key]>;
};

export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}
