import type { MockFunction } from '@suites/types.doubles';
import type { Type, ConstantValue } from '@suites/types.common';
import { UnitReference } from '../unit-reference';
import type { UnitMocker } from '../unit-mocker';
import type { IdentifierToDependency } from '../dependency-container';
import { DependencyContainer } from '../dependency-container';
import { isConstantValue } from '../functions.static';
import { TestBedBuilder } from '../../types';
import type { UnitTestBed } from '../../types';

export interface SociableTestBedBuilder<TClass> extends TestBedBuilder<TClass> {
  expose(dependency: Type): SociableTestBedBuilder<TClass> & TestBedBuilder<TClass>;
}

export class SociableTestBedBuilder<TClass> extends TestBedBuilder<TClass> {
  private readonly classesToExpose: Type[] = [];

  public constructor(
    private readonly mockFn: Promise<MockFunction<unknown>>,
    private readonly unitMocker: UnitMocker,
    private readonly targetClass: Type<TClass>,
    private readonly logger: Console
  ) {
    super();
  }

  public expose(dependency: Type): SociableTestBedBuilder<TClass> & TestBedBuilder<TClass> {
    this.classesToExpose.push(dependency);
    return this;
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
      this.classesToExpose,
      new DependencyContainer(identifiersToMocks)
    );

    if (redundant.mocks.length > 0) {
      redundant.mocks.forEach((identifier) => {
        this.logger.warn(`Suites Warning: Unreachable Mock Detected.
Attempting to mock the dependency '${identifier.identifier.name}' will have no effect as it is not reachable within the current testing context.
This can occur because '${identifier.identifier.name}' is neither a direct dependency of the class under test (${this.targetClass.name}) nor any of
its explicitly exposed dependencies. If '${identifier.identifier.name}' is not intended to influence the unit under test, consider removing this
mocking from your test setup. Alternatively, if this mock is necessary, please ensure all dependent classes
are appropriately exposed. For more guidance, refer to the documentation: https://suites.dev/docs
        `);
      });
    }

    if (redundant.exposed.length > 0) {
      redundant.exposed.forEach((identifier) => {
        this.logger.warn(`Suites Warning: Unreachable Exposed Dependency Detected.
The dependency '${identifier.name}' has been exposed but cannot be reached within the current testing context.
This typically occurs because '${identifier.name}' is not a direct dependency of the unit under test (${this.targetClass.name}) nor any
of its other exposed dependencies. Exposing '${identifier.name}' without it being accessible from the unit under test or
its direct dependencies may lead to incorrect test configurations. To resolve this, please review and adjust your testing
setup to ensure all necessary dependencies are interconnected. Alternatively, if '${identifier.name}' does not influence
the unit under test, consider removing its exposure from your test setup.
For detailed instructions and best practices, refer to our documentation: https://suites.dev/docs.`);
      });
    }

    return {
      unit: instance as TClass,
      unitRef: new UnitReference(container, this.classesToExpose),
    };
  }
}
