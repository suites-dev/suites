import 'reflect-metadata';
export declare class TestClassOne {
    foo(flag: boolean): Promise<string>;
}
export declare class TestClassTwo {
    bar(): Promise<string>;
}
export declare class TestClassThree {
    baz(): string;
}
export interface Logger {
    log(): any;
}
export declare class MainTestClass {
    private readonly testClassOne;
    private readonly testClassTwo;
    private readonly logger;
    constructor(testClassOne: TestClassOne, testClassTwo: TestClassTwo, logger: Logger);
    test(): Promise<string>;
}
export declare class InvalidClass {
    private readonly testClassOne;
    private readonly logger;
    constructor(testClassOne: TestClassOne, logger: Logger);
    test(): Promise<string>;
}
export declare class NestJSTestClass {
    private readonly testClassOne;
    private readonly testClassTwo;
    private readonly logger;
    constructor(testClassOne: TestClassOne, testClassTwo: TestClassTwo, logger: Logger);
    test(): Promise<string>;
}
