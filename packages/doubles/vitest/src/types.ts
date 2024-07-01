import type { MaybeMockedDeep, Mock, Mocked as VitestMocked } from '@vitest/spy';

type MockFunction<T extends (...args: any[]) => any> = VitestMocked<ReturnType<T>> & T;

type MockedProperty<T> = T extends (...args: any[]) => any ? MockFunction<T> : Mocked<T>;

export type Mocked<T> = MaybeMockedDeep<T> & {
  [K in keyof T]: MockedProperty<T[K]>;
};

export type Stub<TArgs extends any[] = any[], TReturn = any> = Mock<TArgs, TReturn>;
