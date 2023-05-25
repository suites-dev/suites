import { UnitReference, UnitTestbed } from '@automock/core';
import { TestBed } from '@automock/jest';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Numberer {
  public returnANumber(): number {
    return Math.floor(Math.random() * 100) + 1;
  }
}

@Injectable()
export class Stringer {
  public returnAString(): string {
    return Math.random().toString(36).slice(2, 8);
  }
}

@Injectable()
export class Useless {
  public voidMethod(): void {
    return;
  }
}

@Injectable()
class MainClass {
  public constructor(
    private readonly dep1: Numberer,
    private readonly dep2: Stringer,
    private readonly dep3: Useless
  ) {}

  public start(): string {
    return this.dep2.returnAString();
  }

  public stop(): number {
    return this.dep1.returnANumber();
  }

  public doNothing(): void {
    return this.dep3.voidMethod();
  }
}

describe('Automock Jest / NestJS E2E Test', () => {
  let unitTestbed: UnitTestbed<MainClass>;

  beforeAll(() => {
    unitTestbed = TestBed.create(MainClass)
      .mock(Stringer)
      .using({
        returnAString: () => 'not-random',
      })
      .compile();
  });

  it('should return an object with two properties, unit and unitRef', () => {
    expect(unitTestbed).toHaveProperty('unit');
    expect(unitTestbed).toHaveProperty('unitRef');
  });

  it('should return a unit which is an instance of the subject class', () => {
    expect(unitTestbed.unit).toBeInstanceOf(MainClass);
  });

  it('should return a unit reference which is an instance of unit reference', () => {
    expect(unitTestbed.unitRef.constructor.name).toBe('UnitReference');
  });

  it('should contain all the method of the subject class', () => {
    expect(unitTestbed.unit.start).toBeDefined();
    expect(unitTestbed.unit.stop).toBeDefined();
  });
});
