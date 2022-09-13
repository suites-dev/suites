import { Type } from './types';
export interface CustomToken {
    index: number;
    param: string;
}
export declare class ReflectorService {
    private readonly reflector;
    private static readonly INJECTED_TOKENS_METADATA;
    private static readonly PARAM_TYPES_METADATA;
    constructor(reflector: typeof Reflect);
    reflectDependencies(targetClass: Type): Map<string | Type<unknown>, Type<unknown>>;
    private reflectParamTokens;
    private reflectParamTypes;
    private static findToken;
    private static findDuplicates;
}
