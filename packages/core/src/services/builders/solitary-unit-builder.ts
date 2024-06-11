import type { MockFunction } from '@suites/types.doubles';
import type { Type, ConstantValue } from '@suites/types.common';
import { UnitReference } from '../unit-reference';
import type { UnitMocker } from '../unit-mocker';
import type { IdentifierToDependency } from '../dependency-container';
import { DependencyContainer } from '../dependency-container';
import { isConstantValue } from '../functions.static';
import type { UnitTestBed } from '../../types';
import { TestBedBuilder } from '../../types';

export interface SolitaryTestBedBuilder<TClass> extends TestBedBuilder<TClass> {}

export class SolitaryTestBedBuilder<TClass>
  extends TestBedBuilder<TClass>
  implements TestBedBuilder<TClass>
{
  public constructor(
    private readonly mockFn: Promise<MockFunction<unknown>>,
    private readonly unitMocker: UnitMocker,
    private readonly targetClass: Type<TClass>,
    private readonly logger: Console
  ) {
    super();
  }

  public async compile(): Promise<UnitTestBed<TClass>> {
    const mockFn = await this.mockFn;

    const identifiersToMocks: IdentifierToDependency[] = this.identifiersToBeMocked.map(
      ([identifier, valueToMock]) => {
        if (isConstantValue(valueToMock)) {
          return [identifier, valueToMock as ConstantValue];
        }

        return [identifier, mockFn(valueToMock)];
      }
    );

    const { container, instance, redundant } = await this.unitMocker.constructUnit<TClass>(
      this.targetClass,
      [],
      new DependencyContainer(identifiersToMocks)
    );

    if (redundant.mocks.length > 0) {
      redundant.mocks.forEach((identifier) => {
        this.logger.warn(`Suites Warning: Unreachable Mock Detected.
Attempting to mock the dependency '${identifier.identifier.name}' will have no effect as it is not reachable within the current testing context.
This can occur because '${identifier.identifier.name}' is neither a direct dependency of the class under test (${this.targetClass.name}) nor any of
its explicitly exposed dependencies. If '${identifier.identifier.name}' is not intended to influence the unit under test, consider removing this
mocking from your test setup. Alternatively, if this mock is necessary, please ensure all dependent classe
are appropriately exposed. For more guidance, refer to the documentation: https://suites.dev/docs
        `);
      });
    }

    return {
      unit: instance as TClass,
      unitRef: new UnitReference(container, []),
    };
  }
}
