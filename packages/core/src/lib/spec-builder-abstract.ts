import { ClassReflector } from '@automock/reflect';
import { DependencyKey, DependencyType, MockPartialImplementation, MockFn, Type } from '@automock/common';
import { MockResolver } from './mock-resolver';
import { Override, TestingUnit } from './types';
import { DependenciesExtractorFactory } from './dependencies-extractor.factory';

export interface SpecBuilder<TClass = any> {
  /**
   * Declares on the dependency to mock
   *
   * @return Override
   * @param token
   */
  mock<T = any>(token: string): Override<T>;
  mock<T = any>(dependency: Type<T>): Override<T>;
  mock<T = any>(dependency: DependencyKey<T>): Override<T>;

  /**
   * Compiles the unit and creates new testing unit
   *
   * @return TestingUnit
   */
  compile(): TestingUnit<TClass>;
}

export abstract class SpecBuilderAbstract<TClass = any> implements SpecBuilder<TClass> {
  private readonly depNamesToMocks = new Map<DependencyKey, MockFn<unknown, unknown>>();
  private readonly classReflector: ClassReflector;

  protected readonly dependencies: DependencyType[] = [];
  protected readonly mockImpls = new Map<DependencyKey, MockPartialImplementation<unknown, unknown>>();

  protected constructor(private readonly targetClass: Type<TClass>) {
    this.classReflector = DependenciesExtractorFactory.create(this.targetClass);
  }

  public abstract mock<T = any>(token: string): Override<T>;
  public abstract mock<T = any>(type: Type<T>): Override<T>;
  public abstract mock<T = any>(typeOrToken: DependencyKey<T>): Override<T>;

  public compile(...args: any[]): TestingUnit<TClass> {
    this.mockUnMockedDependencies(...args);

    const values = Array.from(this.depNamesToMocks.values());

    return {
      unit: new this.targetClass(...values) as TClass,
      unitRef: new MockResolver(this.depNamesToMocks),
    };
  }

  protected abstract voidMock<T>(type: Type<T>, ...args: any[]): MockFn<unknown, unknown>;

  private mockUnMockedDependencies(...args: any[]): void {
    this.classReflector.dependencies.forEach((type: DependencyType, key: DependencyKey) => {
      const existingMock = this.mockImpls.get(key);

      if (existingMock) {
        this.depNamesToMocks.set(key, existingMock);
        return;
      }

      const originalDependency = this.classReflector.resolve(key);

      let mock;

      if (originalDependency.name === 'Object') {
        mock = this.voidMock(class {}, ...args);
      } else {
        mock = this.voidMock(originalDependency, ...args);
      }

      this.depNamesToMocks.set(key, mock);
    });
  }
}
