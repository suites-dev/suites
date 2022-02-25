import 'reflect-metadata';
import { DeepPartial } from 'ts-essentials';
import { MockOf, MockFunction, Override, TestingUnit, Type } from './types';
import { MockResolver } from './mock-resolver';

export interface UnitBuilder<TClass = any> {
  /**
   * Declares on the dependency to mock
   *
   * @see jest-mock-extended in action {@link https://github.com/marchaos/jest-mock-extended#example}
   *
   * @param dependency {Type}
   * @return Override
   */
  mock<T = any>(dependency: Type<T>): Override<T>;
  mock<T = any>(dependency: string): Override<T>;
  mock<T = any>(dependency: Type<T> | string): Override<T>;

  /**
   * Compiles the unit and creates new testing unit
   *
   * @return TestingUnit
   */
  compile(): TestingUnit<TClass>;
}

interface CustomToken {
  index: number;
  param: string;
}

export class UnitBuilder<TClass = any> {
  private static readonly INJECTED_TOKENS_METADATA = 'self:paramtypes';
  private static readonly PARAM_TYPES_METADATA = 'design:paramtypes';

  private readonly dependencies = new Map<Type | string, DeepPartial<unknown>>();
  private readonly depNamesToMocks = new Map<Type | string, MockOf<any>>();

  public constructor(
    private readonly reflector: typeof Reflect,
    private readonly mockFn: MockFunction,
    private readonly targetClass: Type<TClass>
  ) {
    this.dependencies = this.reflectDependencies();
  }

  public mock<T = any>(dependency: string): Override<T>;
  public mock<T = any>(dependency: Type<T>): Override<T>;
  public mock<T = any>(dependency: Type<T> | string): Override<T> {
    return {
      using: (mockImplementation: DeepPartial<T>): UnitBuilder<TClass> => {
        this.depNamesToMocks.set(dependency, this.mockFn<T>(mockImplementation));
        return this;
      },
    };
  }

  private reflectParamTokens(): CustomToken[] {
    return this.reflector.getMetadata(UnitBuilder.INJECTED_TOKENS_METADATA, this.targetClass) || [];
  }

  private reflectParamTypes(): Type<unknown>[] {
    return this.reflector.getMetadata(UnitBuilder.PARAM_TYPES_METADATA, this.targetClass) || [];
  }

  private static findToken(list: CustomToken[], index: number): string | never {
    const record = list.find((element) => element.index === index);

    if (!record) {
      throw new Error('Cannot find token');
    }

    return record.param;
  }

  public compile(): TestingUnit<TClass> {
    const deps = this.mockUnMockedDependencies();
    const values = Array.from(deps.values());

    return {
      unit: new this.targetClass(...values) as TClass,
      unitRef: new MockResolver(deps),
    };
  }

  private reflectDependencies(): Map<string | Type<unknown>, Type<unknown>> {
    const classDependencies = new Map<string | Type<unknown>, Type<unknown>>();

    const types = this.reflectParamTypes();
    const tokens = this.reflectParamTokens();

    types.map((type: Type<unknown>, index: number) => {
      if (type.name === 'Object') {
        try {
          const token = UnitBuilder.findToken(tokens, index);
          classDependencies.set(token, type);
        } catch (error) {
          throw new Error(
            `'${this.targetClass.name}' is missing a token for the dependency at index [${index}], did you forget to inject it using @Inject()?`
          );
        }
      } else {
        classDependencies.set(type, type);
      }
    });

    return classDependencies;
  }

  private mockUnMockedDependencies(): Map<Type | string, MockOf<any>> {
    const map = new Map<Type | string, MockOf<any>>();

    for (const [key, dependency] of this.dependencies.entries()) {
      const overriddenDep = this.depNamesToMocks.get(key);
      const mock = overriddenDep ? overriddenDep : this.mockFn<typeof dependency>();

      map.set(key, mock);
    }

    return map;
  }
}
