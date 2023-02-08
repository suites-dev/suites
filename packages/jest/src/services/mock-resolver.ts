import { Type } from '../types';
import Mocked = jest.Mocked;

export class MockResolver {
  public constructor(private readonly depNamesToMocks: Map<Type | string, Mocked<any>>) {}

  public get<TClass>(type: string): Mocked<TClass>;
  public get<TClass>(type: Type<TClass>): Mocked<TClass>;
  public get<TClass = any>(type: Type<TClass> | string): Mocked<TClass> {
    return this.depNamesToMocks.get(type);
  }
}
