import { Reflectable, Token } from '@automock/reflect';

@Reflectable()
export class TestClassOne {
  async foo(flag: boolean): Promise<string> {
    if (flag) {
      return Promise.resolve('foo-with-flag');
    }

    return Promise.resolve('foo');
  }
}

@Reflectable()
export class TestClassTwo {
  async bar(): Promise<string> {
    return Promise.resolve('bar');
  }
}

@Reflectable()
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

@Reflectable()
export class MainTestClass {
  constructor(
    private readonly testClassOne: TestClassOne,
    private readonly testClassTwo: TestClassTwo,
    private readonly testClassThree: TestClassThree,
    @Token('Logger') private readonly logger: Logger,
    @Token('Queue') private readonly queue: Queue
  ) {}

  async test(): Promise<string> {
    const value = await this.testClassOne.foo(true);
    const value2 = await this.testClassTwo.bar();
    const value3 = this.testClassThree.baz();

    this.logger.log('123456789');

    return `${value}-${value2}-${value3}`;
  }
}
