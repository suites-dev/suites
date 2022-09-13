import 'reflect-metadata';
import { MockFunction, Override, TestingUnit, Type } from './types';
import { ReflectorService } from './reflector.service';
export interface UnitResolver<TClass = any> {
    /**
     * Declares on the dependency to mock
     *
     * @see jest-mock-extended in action {@link https://github.com/marchaos/jest-mock-extended#example}
     *
     * @param dependency {Type}
     * @return Override
     */
    mock<T = any>(dependency: Type<T>): Override<T>;
    mock<T = any>(dependency: string): Override<T>;
    mock<T = any>(dependency: Type<T> | string): Override<T>;
    /**
     * Compiles the unit and creates new testing unit
     *
     * @return TestingUnit
     */
    compile(): TestingUnit<TClass>;
}
export declare class UnitResolver<TClass = any> {
    private readonly reflector;
    private readonly mockFn;
    private readonly targetClass;
    private readonly dependencies;
    private readonly depNamesToMocks;
    constructor(reflector: ReflectorService, mockFn: MockFunction, targetClass: Type<TClass>);
    mock<T = any>(dependency: string): Override<T>;
    mock<T = any>(dependency: Type<T>): Override<T>;
    private mockUnMockedDependencies;
}
