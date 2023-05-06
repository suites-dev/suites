import { Type } from '@automock/types';
import { StubbedInstance } from '../types';

export interface UnitReference {
  /**
   * Returns a reference to the mocked object based
   * on the provided class type.
   *
   * @returns StubbedInstance
   * @param type
   */
  get<TDep>(type: Type<TDep>): StubbedInstance<TDep>;

  /**
   * Returns a reference to the mocked object based
   * on the provided token.
   *
   * @returns StubbedInstance
   * @param token
   */
  get<TDep>(token: string): StubbedInstance<TDep>;

  /**
   * Returns a reference to the mocked object based
   * on the provided token or class type.
   *
   * @returns StubbedInstance
   * @param typeOrToken
   */
  get<TDep>(typeOrToken: Type<TDep> | string): StubbedInstance<TDep>;
}

export class UnitReference {
  public constructor(
    private readonly depNamesToMocks: Map<Type | string, StubbedInstance<unknown>>
  ) {}

  public get<TDep>(type: Type<TDep>): StubbedInstance<TDep>;
  public get<TDep>(token: string): StubbedInstance<TDep>;
  public get<TDep>(typeOrToken: Type<TDep> | string): StubbedInstance<TDep> {
    const dependency = this.depNamesToMocks.get(typeOrToken);

    if (!dependency) {
      throw new Error(
        "It's weird; Automock cannot find the given dependency reference, make sure you've provided a valid type or token."
      );
    }

    return dependency as StubbedInstance<TDep>;
  }
}
