import { UnitReference } from '@automock/core';
import { TestBed, UnitTestBed } from '@automock/sinon';
import { Inject, Injectable } from '@nestjs/common';
import { expect } from 'chai';
import { before } from 'mocha';

interface Logger {
  log(message: string): string;
}

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
    private readonly dep3: Useless,
    @Inject('LOGGER') private readonly logger: Logger,
    @Inject('PRIMITIVE') private readonly primitive: string
  ) {}

  public generateString(): string {
    return this.dep2.returnAString();
  }

  public generateNumber(): number {
    return this.dep1.returnANumber();
  }

  public returnPrimitive(): string {
    return this.primitive;
  }
}

describe('Automock Sinon / NestJS E2E Test', () => {
  let unitTestbed: UnitTestBed<MainClass>;

  before(() => {
    unitTestbed = TestBed.create(MainClass)
      .mock(Stringer)
      .using({
        returnAString: () => 'not-random',
      })
      .mock<Logger>('LOGGER')
      .using({
        log: () => 'dummy-mocked',
      })
      .mock<string>('PRIMITIVE')
      .using('DUMMY-STRING')
      .compile();
  });

  it('should return an object with two properties, unit and unitRef', () => {
    expect(unitTestbed).to.have.property('unit');
    expect(unitTestbed).to.have.property('unitRef');
  });

  it('should return a unit which is an instance of the subject class', () => {
    expect(unitTestbed.unit).to.be.instanceof(MainClass);
  });

  it('should return a unit reference which is an instance of unit reference', () => {
    expect(unitTestbed.unitRef).to.be.instanceof(UnitReference);
  });

  it('should contain all the method of the subject class', () => {
    expect(unitTestbed.unit.generateString).not.to.be.undefined;
    expect(unitTestbed.unit.generateNumber).not.to.be.undefined;
  });

  it('return the default value from test bed builder when calling the target method that triggers the mock', () => {
    expect(unitTestbed.unit.generateString()).to.equal('not-random');
  });

  it('return the exact value when using the jest mocking api', () => {
    unitTestbed.unitRef.get(Numberer).returnANumber.returns(47356);
    expect(unitTestbed.unit.generateNumber()).to.equal(47356);
  });

  it('return the primitive value when using primitive values', () => {
    const primitiveValue = unitTestbed.unitRef.get('PRIMITIVE');

    expect(primitiveValue).to.equal('DUMMY-STRING');
    expect(unitTestbed.unit.returnPrimitive()).to.equal('DUMMY-STRING');
  });
});
