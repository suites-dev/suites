import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TestClassOne {
  async foo(flag: boolean): Promise<string> {
    if (flag) {
      return Promise.resolve('foo-with-flag');
    }

    return Promise.resolve('foo');
  }

  bar(): string {
    return 'bar';
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

@Injectable()
export class TestClassFive {
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

export const SymbolToken = Symbol.for('SymbolToken');
export const SymbolTokenSecond = Symbol.for('SymbolTokenSecond');

type Relation<T> = T;

@Injectable()
export class NestJSTestClass {
  private readonly initiatedValue!: string;

  public constructor(
    @Inject('LOGGER') private readonly logger: Logger,
    @Inject('UNDEFINED') private readonly undefinedParam: undefined,
    @Inject('UNDEFINED_SECOND') private readonly undefinedParamSecond: undefined,
    @Inject(TestClassFour) private readonly testClassFour: undefined,
    @Inject(forwardRef(() => TestClassThree))
    private readonly testClassThree: Relation<TestClassThree>,
    @Inject(Foo) private readonly fooRepository: Repository<Foo>,
    private readonly testClassTwo: TestClassTwo,
    @Inject('CONSTANT_VALUE') private readonly primitiveValue: string,
    private readonly testClassOne: TestClassOne,
    private readonly testClassOneSecond: TestClassOne,
    @Inject(SymbolToken) private readonly symbolToken: TestClassFive,
    @Inject(SymbolTokenSecond) private readonly symbolTokenSecond: never
  ) {
    this.initiatedValue = this.testClassOne.bar();
  }

  async test(): Promise<string> {
    const value2 = await this.testClassTwo.bar();
    const value3 = this.logger.log();

    return `${value2}-${value3}-${this.initiatedValue}`;
  }

  async testDuplicateIdentifier() {
    const value1 = await this.testClassOne.foo(false);
    const value2 = await this.testClassOneSecond.foo(false);

    return `${value1}<>${value2}`;
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

  @Inject('CONSTANT_VALUE')
  private readonly primitiveValue: string;

  @Inject(TestClassOne)
  private readonly testClassOne: TestClassOne;

  @Inject(SymbolToken)
  private readonly symbolToken: TestClassFive;

  @Inject(SymbolTokenSecond)
  private readonly symbolTokenSecond: never;

  async test(): Promise<string> {
    const value2 = await this.testClassTwo.bar();
    const value3 = this.logger.log();

    return `${value2}-${value3}`;
  }
}
