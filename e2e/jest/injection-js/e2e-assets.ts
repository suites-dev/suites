import 'reflect-metadata';
import { Host, Inject, Injectable, Optional, Self, SkipSelf } from 'injection-js';

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
export const API_URL = 'API_URL';
export const CONSTANT_VALUE = 'CONSTANT_VALUE';

type Relation<T> = T;

@Injectable()
export class InjectionJsTestClass {
  private readonly initiatedValue!: string;

  public constructor(
    private readonly testClassOne: TestClassOne,
    @Inject('LOGGER') private readonly logger: Logger,
    @Inject(API_URL) private readonly apiUrl: string,
    @Inject(TestClassFour) private readonly testClassFour: TestClassFour,
    private readonly testClassThree: TestClassThree,
    @Inject(Foo) private readonly fooRepository: Repository<Foo>,
    private readonly testClassTwo: TestClassTwo,
    @Inject(CONSTANT_VALUE) private readonly primitiveValue: string,
    private readonly testClassOneSecond: TestClassOne,
    @Inject(SymbolToken) private readonly symbolToken: TestClassFive,
    @Optional() private readonly optionalDep?: Bar
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

  testOptional(): string {
    return this.optionalDep ? 'has-optional' : 'no-optional';
  }
}

