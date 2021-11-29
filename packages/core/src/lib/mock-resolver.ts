import { MockOf, Type } from '@aromajs/common';

export class MockResolver<M extends MockOf<any>> {
  public constructor(private readonly depNamesToMocks: Map<Type, MockOf<unknown>>) {}

  public get<T>(type: Type<T>): M {
    return this.depNamesToMocks.get(type) as M;
  }
}
