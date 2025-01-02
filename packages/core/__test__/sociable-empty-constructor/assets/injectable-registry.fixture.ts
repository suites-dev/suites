import type { ClassInjectable, InjectableRegistry } from '@suites/types.di';

export class TestDependService {
  public call(bool: boolean) {
    console.log('TestDependService', bool);
  }
}

export class TestSociableService {
  public return(): boolean {
    return true;
  }
}

export class TestService {
  constructor(
    private readonly testDependService: TestDependService,
    private readonly testSociableService: TestSociableService
  ) {}

  public test(): void {
    this.testDependService.call(this.testSociableService.return());
  }
}

export const testServiceRegistry: InjectableRegistry = {
  list(): ClassInjectable[] {
    return [
      { identifier: TestDependService, value: TestDependService, type: 'PARAM' },
      { identifier: TestSociableService, value: TestSociableService, type: 'PARAM' },
    ];
  },
  resolve: () => undefined,
};

export const emptyRegistry: InjectableRegistry = {
  list: (): ClassInjectable[] => [],
  resolve: () => undefined,
};
