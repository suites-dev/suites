import {
  inject,
  injectable,
  LazyServiceIdentifer,
  multiInject,
  named,
  tagged,
  targetName,
} from 'inversify';

const throwable = tagged('canThrow', true);

@injectable()
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

@injectable()
export class TestClassTwo {
  async bar(): Promise<string> {
    return Promise.resolve('bar');
  }
}

@injectable()
export class TestClassThree {
  baz(): string {
    return 'baz';
  }
}

@injectable()
export class TestClassFour {
  doSomething(): string {
    return 'something';
  }
}

@injectable()
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

@injectable()
export class InversifyJSTestClass {
  private readonly initiatedValue!: string;

  public constructor(
    private readonly testClassOne: TestClassOne,
    @inject('LOGGER') private readonly logger: Logger,
    @inject('UNDEFINED') private readonly undefinedParam: undefined,
    @inject('BarToken')
    @targetName('someTarget')
    private readonly undefinedParamSecond: Bar,
    @inject(TestClassFour) @throwable private readonly testClassFour: Foo,
    @inject(new LazyServiceIdentifer(() => TestClassThree))
    private readonly testClassThree: Relation<TestClassThree>,
    @inject(Foo) @named('arbitraryName') private readonly fooRepository: Repository<Foo>,
    private readonly testClassTwo: TestClassTwo,
    @inject('CONSTANT_VALUE') private readonly primitiveValue: string,
    private readonly testClassOneSecond: TestClassOne,
    @inject(SymbolToken) private readonly symbolToken: TestClassFive,
    @multiInject(SymbolTokenSecond) private readonly symbolTokenSecond: string[]
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

@injectable()
export class InversifyJSTestClassProp {
  @inject('LOGGER')
  private readonly logger: Logger;

  @inject('UNDEFINED')
  private readonly undefinedParam: undefined;

  @inject('UNDEFINED_SECOND')
  private readonly undefinedParamSecond: undefined;

  @inject(TestClassFour)
  private readonly testClassFour: undefined;

  @inject(new LazyServiceIdentifer(() => TestClassThree))
  private readonly testClassThree: Relation<TestClassThree>;

  @inject(Foo)
  private readonly fooRepository: Repository<Foo>;

  @inject(TestClassTwo)
  private readonly testClassTwo: TestClassTwo;

  @inject('CONSTANT_VALUE')
  private readonly primitiveValue: string;

  @inject(TestClassOne)
  private readonly testClassOne: TestClassOne;

  @inject(SymbolToken)
  private readonly symbolToken: TestClassFive;

  @inject(SymbolTokenSecond)
  private readonly symbolTokenSecond: never;

  async test(): Promise<string> {
    const value2 = await this.testClassTwo.bar();
    const value3 = this.logger.log();

    return `${value2}-${value3}`;
  }
}
