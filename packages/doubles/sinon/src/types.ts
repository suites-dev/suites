import type { SinonStub } from 'sinon';

type MockFunction<T extends (...args: any[]) => any> = SinonStub<Parameters<T>, ReturnType<T>> & T;

type MockedProperty<T> = T extends (...args: any[]) => any ? MockFunction<T> : Mocked<T>;

export type Mocked<T> = {
  [Key in keyof T]: MockedProperty<T[Key]>;
};

export type Stub<TArgs extends any[] = any[], TReturn = any> = SinonStub<TArgs, TReturn>;
