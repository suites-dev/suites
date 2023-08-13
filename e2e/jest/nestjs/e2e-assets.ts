import { forwardRef, Inject, Injectable } from '@nestjs/common';

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
export class TestClassFour {
  doSomething(): string {
    return 'something';
  }
}

export interface Repository<T> {
  value: T;
}

export class ClassThatIsNotInjected {}

export interface Logger {
  log(): any;
}

export class Foo {}
export class Bar {}

type Relation<T> = T;

@Injectable()
export class NestJSTestClass {
  public constructor(
    @Inject('LOGGER') private readonly logger: Logger,
    @Inject('UNDEFINED') private readonly undefinedParam: undefined,
    @Inject('UNDEFINED_SECOND') private readonly undefinedParamSecond: undefined,
    @Inject(TestClassFour) private readonly testClassFour: undefined,
    @Inject(forwardRef(() => TestClassThree))
    private readonly testClassThree: Relation<TestClassThree>,
    @Inject(Foo) private readonly fooRepository: Repository<Foo>,
    private readonly testClassTwo: TestClassTwo,
    @Inject('PRIMITIVE_VALUE') private readonly primitiveValue: string,
    private readonly testClassOne: TestClassOne
  ) {}

  async test(): Promise<string> {
    const value2 = await this.testClassTwo.bar();
    const value3 = this.logger.log();

    return `${value2}-${value3}`;
  }
}

@Injectable()
export class NestJSTestClassProp {
  @Inject('LOGGER')
  private readonly logger: Logger;

  @Inject('UNDEFINED')
  private readonly undefinedParam: undefined;

  @Inject('UNDEFINED_SECOND')
  private readonly undefinedParamSecond: undefined;

  @Inject(TestClassFour)
  private readonly testClassFour: undefined;

  @Inject(forwardRef(() => TestClassThree))
  private readonly testClassThree: Relation<TestClassThree>;

  @Inject(Foo)
  private readonly fooRepository: Repository<Foo>;

  @Inject(TestClassTwo)
  private readonly testClassTwo: TestClassTwo;

  @Inject('PRIMITIVE_VALUE')
  private readonly primitiveValue: string;

  @Inject(TestClassOne)
  private readonly testClassOne: TestClassOne;

  async test(): Promise<string> {
    const value2 = await this.testClassTwo.bar();
    const value3 = this.logger.log();

    return `${value2}-${value3}`;
  }
}
