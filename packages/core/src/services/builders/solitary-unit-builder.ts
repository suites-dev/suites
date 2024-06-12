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

    const { container, instance, resolution } = await this.unitMocker.constructUnit<TClass>(
      this.targetClass,
      [],
      new DependencyContainer(identifiersToMocks)
    );

    if (resolution.notFound.length > 0) {
      resolution.notFound.forEach(([identifier]) => {
        this.logger.warn(`Suites Warning: Redundant Mock Configuration Detected.
You are attempting to mock '${identifier.identifier.toString()}', which is not a dependency of the unit under test ('${this.targetClass.name}').
This mock will have no effect as it does not interact directly with the tested unit. Such configurations may lead to
misunderstandings about the test's behavior and can safely be removed if '${identifier.identifier.toString()}' does not
impact the test outcomes. If you believe this mock is required, please double-check your unit's dependencies and their
interactions. For detailed guidelines on setting up solitary tests, refer to: https://suites.dev/docs.`);
      });
    }

    return {
      unit: instance as TClass,
      unitRef: new UnitReference(container, []),
    };
  }
}
