import type { SinonStub } from 'sinon';

type MockFunction<T extends (...args: any[]) => any> = SinonStub<ReturnType<T>, Parameters<T>> & T;

type MockedProperty<T> = T extends (...args: any[]) => any ? MockFunction<T> : Mocked<T>;

export type Mocked<T> = {
  [Key in keyof T]: MockedProperty<T[Key]>;
};

export type Stub<TReturn = any> = SinonStub<any[], TReturn>;
