import type { DoublesAdapter } from '@suites/types.doubles';
import type { Type } from '@suites/types.common';
import { UnitReference } from '../unit-reference';
import type { UnitMocker } from '../unit-mocker';
import type { IdentifierToMockOrFinal, IdentifierToMockImplWithCb } from '../dependency-container';
import { DependencyContainer } from '../dependency-container';
import type { UnitTestBed } from '../../types';
import { TestBedBuilder } from './testbed-builder';

export interface SolitaryTestBedBuilder<TClass> extends TestBedBuilder<TClass> {}

export class SolitaryTestBedBuilder<TClass>
  extends TestBedBuilder<TClass>
  implements TestBedBuilder<TClass>
{
  public constructor(
    private readonly doublesAdapter: Promise<DoublesAdapter>,
    private readonly unitMocker: UnitMocker,
    private readonly targetClass: Type<TClass>,
    private readonly logger: Console
  ) {
    super();
  }

  public async compile(): Promise<UnitTestBed<TClass>> {
    const mockFn = await this.doublesAdapter.then((adapter) => adapter.mock);
    const stubFn = await this.doublesAdapter.then((adapter) => adapter.stub);

    const identifiersToMocksImpls: IdentifierToMockOrFinal[] = this.identifiersToBeMocked.map(
      ([identifier, mockImplCallback]: IdentifierToMockImplWithCb) => {
        return [identifier, mockFn(mockImplCallback(stubFn))];
      }
    );

    const identifiersToFinal: IdentifierToMockOrFinal[] = this.identifiersToBeFinalized.map(
      ([identifier, finalImpl]: IdentifierToMockOrFinal) => {
        return [identifier, finalImpl];
      }
    );

    const { container, instance, resolution } = await this.unitMocker.constructUnit<TClass>(
      this.targetClass,
      [],
      new DependencyContainer([...identifiersToMocksImpls, ...identifiersToFinal])
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
      unitRef: new UnitReference(container, [], this.identifiersToBeFinalized),
    };
  }
}
