type MockFunction<T extends (...args: any[]) => any> = jest.Mock<ReturnType<T>, Parameters<T>> & T;

type MockedProperty<T> = T extends (...args: any[]) => any ? MockFunction<T> : Mocked<T>;

export type Mocked<T> = {
  [Key in keyof T]: MockedProperty<T[Key]>;
};

export type Stub<TArgs extends any[] = any[]> = jest.Mock<any, TArgs>;
