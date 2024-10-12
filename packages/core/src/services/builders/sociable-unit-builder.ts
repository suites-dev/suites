import type { DoublesAdapter } from '@suites/types.doubles';
import type { Type } from '@suites/types.common';
import type { InjectableIdentifier } from '@suites/types.di';
import { UnitReference } from '../unit-reference';
import type { UnitMocker } from '../unit-mocker';
import type { IdentifierToMockOrFinal } from '../dependency-container';
import { DependencyContainer } from '../dependency-container';
import type { UnitTestBed } from '../../types';
import { TestBedBuilder } from './testbed-builder';

export interface SociableTestBedBuilder<TClass> {
  expose(dependency: Type): SociableTestBedBuilder<TClass>;
  expose(dependency: symbol | string, concreteImplementation: Type): SociableTestBedBuilder<TClass>;
}

export class SociableTestBedBuilder<TClass> extends TestBedBuilder<TClass> {
  private readonly classesToExpose: Map<InjectableIdentifier, Type> = new Map();

  public constructor(
    private readonly doublesAdapter: Promise<DoublesAdapter>,
    private readonly unitMocker: UnitMocker,
    private readonly targetClass: Type<TClass>,
    private readonly logger: Console
  ) {
    super();
  }

  public expose(
    dependency: InjectableIdentifier,
    concreteImplementation?: Type
  ): SociableTestBedBuilder<TClass> & TestBedBuilder<TClass> {
    if (typeof dependency === 'function') {
      this.classesToExpose.set(dependency, dependency);
      return this;
    }

    // Type assertion with "!" because interface overloads guarantee concreteImplementation must be passed
    this.classesToExpose.set(dependency, concreteImplementation!);

    return this;
  }

  public async compile(): Promise<UnitTestBed<TClass>> {
    const mockFn = await this.doublesAdapter.then((adapter) => adapter.mock);
    const stubCb = await this.doublesAdapter.then((adapter) => adapter.stub);

    const identifiersToMocks: IdentifierToMockOrFinal[] = this.identifiersToBeMocked.map(
      ([identifier, mockImplCallback]) => {
        return [identifier, mockFn(mockImplCallback(stubCb))];
      }
    );

    const identifiersToFinal: IdentifierToMockOrFinal[] = this.identifiersToBeFinalized.map(
      ([identifier, finalImpl]: IdentifierToMockOrFinal) => {
        return [identifier, finalImpl];
      }
    );

    const { container, instance, resolution } = await this.unitMocker.constructUnit<TClass>(
      this.targetClass,
      this.classesToExpose,
      new DependencyContainer([...identifiersToMocks, ...identifiersToFinal])
    );

    if (resolution.mocks.length > 0) {
      resolution.mocks.forEach((identifier) => {
        this.logger.warn(`Suites Warning: Unreachable Mock Configuration Detected.
You attempted to mock '${identifier.identifier.name}', which is not directly involved in the current testing context of '${this.targetClass.name}'.
This mock will not affect the outcome of your tests because '${identifier.identifier.name}' is neither a direct dependency of the tested unit nor is it
among the dependencies explicitly exposed. If '${identifier.identifier.name}' does not influence the unit under test, consider removing this mock from your
setup to streamline your test configuration. However, if this mock is crucial, verify that all required dependencies are correctly exposed.
For detailed guidance on configuring sociable tests, please consult: https://suites.dev/docs.`);
      });
    }

    if (resolution.exposes.length > 0) {
      resolution.exposes.forEach((identifier) => {
        const dependency =
          typeof identifier === 'function' ? identifier.name : identifier.toString();
        this.logger.warn(`Suites Warning: Unreachable Exposed Dependency Detected.
The dependency '${dependency}' has been exposed but cannot be reached within the current testing context.
This typically occurs because '${dependency}' is not a direct dependency of the unit under test (${this.targetClass.name}) nor any
of its other exposed dependencies. Exposing '${dependency}' without it being accessible from the unit under test or
its dependencies may lead to incorrect test configurations. To resolve this, please review and adjust your testing
setup to ensure all necessary dependencies are interconnected. Alternatively, if '${dependency}' does not influence
the unit under test, consider removing its exposure from your test setup.
For detailed instructions and best practices, refer to our documentation: https://suites.dev/docs.`);
      });
    }

    return {
      unit: instance as TClass,
      unitRef: new UnitReference(container, this.classesToExpose, this.identifiersToBeFinalized),
    };
  }
}
