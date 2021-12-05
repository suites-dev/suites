import 'reflect-metadata';
import { Injectable, Inject } from '@nestjs/common';

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

export interface Logger {
  log: (msg: string) => void;
}

export interface Queue {
  publish: (data: any) => void;
}

@Injectable()
export class MainTestClass {
  constructor(
    private readonly testClassOne: TestClassOne,
    private readonly testClassTwo: TestClassTwo,
    private readonly testClassThree: TestClassThree,
    @Inject('Logger') private readonly logger: Logger,
    @Inject('Queue') private readonly queue: Queue
  ) {}

  async test(): Promise<string> {
    const value = await this.testClassOne.foo(true);
    const value2 = await this.testClassTwo.bar();
    const value3 = this.testClassThree.baz();

    this.logger.log('123456789');

    return `${value}-${value2}-${value3}`;
  }
}
