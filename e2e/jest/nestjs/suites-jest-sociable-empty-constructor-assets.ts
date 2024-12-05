import { Injectable } from "@nestjs/common";

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

@Injectable()
export class TestService {
  constructor(
    private readonly testDependService: TestDependService,
    private readonly testSociableService: TestSociableService,
  ) {}

  public test(): void {
    this.testDependService.call(this.testSociableService.return());
  }
}
