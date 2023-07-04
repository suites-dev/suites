import 'reflect-metadata';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
  log(): any;
}

@Injectable()
export class MainTestClass {
  constructor(
    private readonly testClassOne: TestClassOne,
    private readonly testClassTwo: TestClassTwo,
    private readonly testClassTwoSecond: TestClassTwo,
    @Inject('LOGGER') private readonly logger: Logger,
    @Inject('PRIMITIVE_VALUE') private readonly primitiveValue: string
  ) {}

  async test(): Promise<string> {
    const value = await this.testClassOne.foo(true);
    const value2 = await this.testClassTwo.bar();
    const value3 = this.logger.log();

    return `${value}-${value2}-${value3}-${this.primitiveValue}`;
  }
}

export class Foo {}
export class Bar {}

type Relation<T> = T;

@Injectable()
export class NestJSTestClass {
  constructor(
    @Inject('LOGGER') private readonly logger: Logger,
    @Inject(forwardRef(() => TestClassThree))
    private readonly testClassThree: Relation<TestClassThree>,
    @InjectRepository(Foo) private readonly fooRepository: Repository<Foo>,
    @InjectRepository(Bar) private readonly barRepository: Repository<Bar>,
    private readonly testClassOne: TestClassOne,
    private readonly testClassTwo: TestClassTwo,
    @Inject('PRIMITIVE_VALUE') private readonly primitiveValue: string
  ) {}

  async test(): Promise<string> {
    const value = await this.testClassOne.foo(true);
    const value2 = await this.testClassTwo.bar();
    const value3 = this.logger.log();

    return `${value}-${value2}-${value3}`;
  }
}
