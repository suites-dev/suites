import { MockOf, Type } from './types';

export class MockResolver {
  public constructor(private readonly depNamesToMocks: Map<Type | string, MockOf<any>>) {}

  public get<TClass>(type: string): MockOf<TClass>;
  public get<TClass>(type: Type<TClass>): MockOf<TClass>;

  public get<TClass = any>(type: Type<TClass> | string): MockOf<TClass> {
    return this.depNamesToMocks.get(type);
  }
}
