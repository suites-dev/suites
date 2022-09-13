import { UnitResolver } from './unit-resolver';
import { Type } from './types';
export declare class Spec {
    /**
     * Create new unit builder
     * @param targetClass
     * @return UnitResolver
     */
    static create<TClass = any>(targetClass: Type<TClass>): UnitResolver<TClass>;
}
