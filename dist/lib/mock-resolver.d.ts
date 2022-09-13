/// <reference types="jest" />
import { Type } from './types';
import Mocked = jest.Mocked;
export declare class MockResolver {
    private readonly depNamesToMocks;
    constructor(depNamesToMocks: Map<Type | string, Mocked<any>>);
    get<TClass>(type: string): Mocked<TClass>;
    get<TClass>(type: Type<TClass>): Mocked<TClass>;
}
