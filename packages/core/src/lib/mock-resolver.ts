import { MockFn, DependencyKey, Type } from '@automock/common';

export class MockResolver {
  public constructor(private readonly depNamesToMocks: Map<DependencyKey<unknown>, MockFn<unknown, unknown>>) {}

  public get<T>(token: string): MockFn<T, MockFn<T, any>>;
  public get<T>(type: Type<T>): MockFn<T, MockFn<T, any>>;

  public get<T>(type: DependencyKey<T>): MockFn<T, MockFn<T, any>> {
    const mock = this.depNamesToMocks.get(type) as MockFn<T, MockFn<T, any>>;

    if (!mock) {
      let error: string;

      if (typeof type === 'string') {
        error = `AutoMock cannot find a token named ${type}, are you sure it is injected to the class constructor?`;
      } else {
        error = `AutoMock cannot find a dependency named ${type.name}, are you sure it is injected to the class constructor?`;
      }

      throw new Error(error);
    }

    return mock;
  }
}
