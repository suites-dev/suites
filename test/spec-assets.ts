import { Injectable } from '@nestjs/common';
import { Spec } from '../src';

@Injectable()
export class TestClassOne {
  async foo(flag: boolean): Promise<string> {
    if (flag) {
      return Promise.resolve('foo-with-flag');
    }

    return Promise.resolve('foo');
  }
}

@Injectable()
export class TestClassTwo {
  async bar(): Promise<string> {
    return Promise.resolve('bar');
  }
}

@Injectable()
export class TestClassThree {
  baz(): string {
    return 'baz';
  }
}

@Injectable()
export class MainTestClass {
  constructor(
    private readonly testClassOne: TestClassOne,
    private readonly testClassTwo: TestClassTwo,
    private readonly testClassThree: TestClassThree
  ) {}

  value() {
    return this.testClassThree.baz();
  }

  async test(): Promise<string> {
    const value = await this.testClassOne.foo(true);
    const value2 = await this.testClassTwo.bar();
    const value3 = this.testClassThree.baz();

    return `${value}-${value2}-${value3}`;
  }
}

export const UnitBuilder = Spec.createUnit<MainTestClass>(MainTestClass)
  .mock(TestClassOne)
  .using({
    async foo(): Promise<string> {
      return 'foo-from-test';
    },
  })
  .mockDeep(TestClassThree)
  .using({
    baz(): string {
      return 'baz-from-test';
    },
  });
