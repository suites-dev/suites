import { DeepMocked } from '@automock/doubles.jest';
import { Type } from '../types';

export class MockResolver {
  public constructor(private readonly depNamesToMocks: Map<Type | string, DeepMocked<any>>) {}

  public get<TClass>(type: string): DeepMocked<TClass>;
  public get<TClass>(type: Type<TClass>): DeepMocked<TClass>;
  public get<TClass = any>(type: Type<TClass> | string): DeepMocked<TClass> {
    return this.depNamesToMocks.get(type);
  }
}
