import type { MockFunction } from '@suites/types.doubles';
import type { DependencyInjectionAdapter } from '@suites/types.di';
import type { Type, ConstantValue } from '@suites/types.common';
import { UnitReference } from '../unit-reference';
import type { UnitMocker } from '../unit-mocker';
import type { IdentifierToDependency } from '../dependency-container';
import { DependencyContainer } from '../dependency-container';
import { isConstantValue, mockDependencyNotFoundMessage } from '../functions.static';
import type { UnitTestBed } from '../../types';
import { TestBedBuilder } from '../../types';

export interface SolitaryTestBedBuilder<TClass> extends TestBedBuilder<TClass> {}

export class SolitaryTestBedBuilder<TClass> extends TestBedBuilder<TClass> {
  public constructor(
    private readonly mockFn: Promise<MockFunction<unknown>>,
    private readonly diAdapter: Promise<DependencyInjectionAdapter>,
    private readonly unitMocker: UnitMocker,
    private readonly targetClass: Type<TClass>,
    private readonly logger: Console
  ) {
    super();
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
      [],
      new DependencyContainer(identifiersToMocks)
    );

    return {
      unit: instance as TClass,
      unitRef: new UnitReference(container, []),
    };
  }
}