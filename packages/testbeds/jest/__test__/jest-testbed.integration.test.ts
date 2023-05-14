import { TestBed } from '../src';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Dep1 {}

@Injectable()
export class Dep2 {
  public returnAString(): string {
    return 'string';
  }
}

@Injectable()
export class Dep3 {}

@Injectable()
class MainClass {
  public constructor(
    private readonly dep1: Dep1,
    private readonly dep2: Dep2,
    private readonly dep3: Dep3
  ) {}

  public start() {
    return this.dep2.returnAString();
  }
}

describe('Jest Testbed Integration Test', () => {
  const { unit, unitRef } = TestBed.create(MainClass)
    .mock(Dep2)
    .using({
      returnAString(): string {
        return '123';
      },
    })
    .compile();

  it('should pass', () => {
    const result = unit.start();
    expect(result).toBe('123');
  });
});
