import { Injectable } from '@nestjs/common';

@Injectable()
export class TestClassOne {
  async foo(): Promise<string> {
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
export class MainTestClass {
  constructor(private readonly testClassOne: TestClassOne, private readonly testClassTwo: TestClassTwo) {}

  async bazz(): Promise<string> {
    const value = await this.testClassOne.foo();
    const value2 = await this.testClassTwo.bar();

    return `${value}-${value2}-bazz`;
  }
}
