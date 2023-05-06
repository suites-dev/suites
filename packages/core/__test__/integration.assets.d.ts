export declare class DependencyOne {
    print(): string;
}
export declare class DependencyTwo {
    print(): string;
}
export declare class DependencyThree {
    print(): string;
}
export declare class DependencyFourToken {
    print(): string;
}
export declare class DependencyFive {
    print(): string;
}
export declare class MainClass {
    private readonly dependencyOne;
    private readonly dependencyTwo;
    private readonly dependencyThree;
    private readonly dependencyFour;
    constructor(dependencyOne: DependencyOne, dependencyTwo: DependencyTwo, dependencyThree: DependencyThree, dependencyFour: DependencyFourToken);
}
