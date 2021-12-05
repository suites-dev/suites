import { ConcreteMock, DependencyKey, Type } from '@automock/common';

export class MockResolver {
  public constructor(private readonly depNamesToMocks: Map<DependencyKey<unknown>, ConcreteMock<unknown, unknown>>) {}

  public get<T>(token: string): ConcreteMock<T, ConcreteMock<T, any>>;
  public get<T>(type: Type<T>): ConcreteMock<T, ConcreteMock<T, any>>;

  public get<T>(type: DependencyKey<T>): ConcreteMock<T, ConcreteMock<T, any>> {
    return this.depNamesToMocks.get(type) as ConcreteMock<T, ConcreteMock<T, any>>;
  }
}
