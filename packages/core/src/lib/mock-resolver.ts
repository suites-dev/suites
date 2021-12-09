import { MockFn, DependencyKey, Type } from '@automock/common';

export class MockResolver {
  public constructor(private readonly depNamesToMocks: Map<DependencyKey<unknown>, MockFn<unknown, unknown>>) {}

  public get<T>(token: string): MockFn<T, MockFn<T, any>>;
  public get<T>(type: Type<T>): MockFn<T, MockFn<T, any>>;

  public get<T>(type: DependencyKey<T>): MockFn<T, MockFn<T, any>> {
    return this.depNamesToMocks.get(type) as MockFn<T, MockFn<T, any>>;
  }
}
