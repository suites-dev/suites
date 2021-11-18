import { Type } from '@nestjs/common/interfaces';
import { DeepMock } from './types';

export class MockResolver {
  public constructor(private readonly depNamesToMocks: Map<Type, DeepMock<unknown>>) {}

  public get<TClass>(type: Type<TClass>): DeepMock<TClass> {
    return this.depNamesToMocks.get(type) as DeepMock<TClass>;
  }
}
