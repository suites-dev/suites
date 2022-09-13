import { DeepPartial } from 'ts-essentials';
import { mock } from 'jest-mock-extended';
import { UnitResolver } from './unit-resolver';
import { MockResolver } from './mock-resolver';
export interface Override<T> {
    using: (mockImplementation: DeepPartial<T>) => UnitResolver;
}
export interface TestingUnit<TClass = any> {
    unit: TClass;
    unitRef: MockResolver;
}
export interface Type<T = any> extends Function {
    new (...args: any[]): T;
}
export declare type MockFunction = typeof mock;
