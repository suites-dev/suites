import { UnitTestBed } from '@automock/core';
import { TestBed } from '@automock/jest';
import { Injectable, Inject, forwardRef } from '@nestjs/common';

export class DependencyOne {
  print(): string {
    return 'dependencyOne';
  }
}

export class DependencyTwo {
  print(): string {
    return 'dependencyTwo';
  }
}

interface DependencyThreeInterface {
  print(): string;
}

export class DependencyThree implements DependencyThreeInterface {
  print(): string {
    return 'dependencyThree';
  }
}

export interface DependencyFourTokenInterface {
  print(): string;
}

@Injectable()
export class MainClass {
  @Inject(DependencyOne)
  private readonly dependencyOne: DependencyOne;

  @Inject(DependencyTwo)
  private readonly dependencyTwo: DependencyTwo;

  @Inject(forwardRef(() => DependencyThree))
  private readonly dependencyThree: DependencyThree;

  @Inject('CUSTOM_TOKEN')
  public readonly dependencyFour: DependencyFourTokenInterface;

  @Inject('LITERAL_VALUE_ARR')
  private readonly literalValueArray: string[];

  @Inject('LITERAL_VALUE_STR')
  private readonly literalValueString: string;

  public generateString(): string {
    return this.dependencyTwo.print();
  }

  public returnStringValue() {
    return this.literalValueString;
  }
}

describe('Automock Jest / NestJS E2E Test', () => {
  let unitTestbed: UnitTestBed<MainClass>;

  beforeAll(() => {
    unitTestbed = TestBed.create(MainClass)
      .mock(DependencyTwo)
      .using({
        print: () => 'mocked-dep-2-print',
      })
      .mock(DependencyThree)
      .using({
        print: () => 'mocked-dep-3-print',
      })
      .mock<DependencyFourTokenInterface>('CUSTOM_TOKEN')
      .using({
        print: () => 'dep-four-with-custom-token',
      })
      .mock<string>('LITERAL_VALUE_STR')
      .using('string-from-mock')
      .compile();

    console.log(unitTestbed.unitRef);
  });

  test('unit generateString() method should return "mocked-dep-2-print" since it has been overridden in the builder', () => {
    expect(unitTestbed.unit.generateString()).toBe('mocked-dep-2-print');
  });

  test('DependencyOne should remain unchanged and just be a stub', () => {
    const dependencyOne = unitTestbed.unitRef.get(DependencyOne);

    expect(dependencyOne).toBeDefined();
    expect(dependencyOne.print).toHaveProperty('mockReturnValue');
  });

  test('DependencyThree should replaced with constant value', () => {
    const dependencyThree = unitTestbed.unitRef.get(DependencyThree);
    expect(dependencyThree).toHaveProperty('print');
  });

  test('literalValueArray should be ["1", "2", "3"] since it has been overridden in the builder', () => {
    const value = unitTestbed.unit.returnStringValue();
    expect(value).toEqual('string-from-mock');
  });
});
