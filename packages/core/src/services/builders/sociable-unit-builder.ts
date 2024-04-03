import { MockFunction } from '@suites/types.doubles';
import { DependencyInjectionAdapter } from '@suites/types.di';
import { Type, ConstantValue } from '@suites/types.common';
import { UnitReference } from '../unit-reference';
import { UnitMocker } from '../unit-mocker';
import { IdentifierToDependency, DependencyContainer } from '../dependency-container';
import { isConstantValue, mockDependencyNotFoundMessage } from '../functions.static';
import { TestBedBuilder, UnitTestBed } from '../../types';
import { TestBedBuilderAbstract } from './abstract-base-builder';

export interface SociableTestBedBuilder<TClass> extends TestBedBuilder<TClass> {
  expose(dependency: Type): SociableTestBedBuilder<TClass>;
}

export class SociableTestBedBuilder<TClass>
  extends TestBedBuilderAbstract<TClass>
  implements TestBedBuilder<TClass>
{
  private readonly classesToExpose: Type[] = [];

  public constructor(
    private readonly mockFn: Promise<MockFunction<unknown>>,
    private readonly diAdapter: Promise<DependencyInjectionAdapter>,
    private readonly unitMocker: UnitMocker,
    private readonly targetClass: Type<TClass>,
    private readonly logger: Console
  ) {
    super();
  }

  public expose(dependency: Type): SociableTestBedBuilder<TClass> {
    this.classesToExpose.push(dependency);
    return this;
  }

  public async compile(): Promise<UnitTestBed<TClass>> {
    const diAdapter = await this.diAdapter;
    const dependencyContainer = diAdapter.inspect(this.targetClass);
    const mockFn = await this.mockFn;

    const identifiersToMocks: IdentifierToDependency[] = this.identifiersToBeMocked.map(
      ([identifier, valueToMock]) => {
        const dependency = dependencyContainer.resolve<never>(
          identifier.identifier,
          identifier.metadata as never
        );

        if (!dependency) {
          this.logger.warn(
            mockDependencyNotFoundMessage(identifier.identifier, identifier.metadata as never)
          );
        }

        if (isConstantValue(valueToMock)) {
          return [identifier, valueToMock as ConstantValue];
        }

        return [identifier, mockFn(valueToMock)];
      }
    );

    const { container, instance } = await this.unitMocker.constructUnit<TClass>(
      this.targetClass,
      this.classesToExpose,
      new DependencyContainer(identifiersToMocks)
    );

    return {
      unit: instance as TClass,
      unitRef: new UnitReference(container, this.classesToExpose),
    };
  }
}
