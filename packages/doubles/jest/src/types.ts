import MockInstance = jest.MockInstance;
import ArgsType = jest.ArgsType;

export type DeepMocked<Type> = {
  [Key in keyof Type]: Required<Type>[Key] extends (...args: never[]) => infer U
    ? MockInstance<ReturnType<Required<Type>[Key]>, ArgsType<Type[Key]>> &
        ((...args: ArgsType<Type[Key]>) => DeepMocked<U>)
    : Type[Key];
} & Type;
