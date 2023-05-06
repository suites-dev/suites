"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainClass = exports.DependencyFive = exports.DependencyFourToken = exports.DependencyThree = exports.DependencyTwo = exports.DependencyOne = void 0;
class DependencyOne {
    print() {
        return 'dependencyOne';
    }
}
exports.DependencyOne = DependencyOne;
class DependencyTwo {
    print() {
        return 'dependencyTwo';
    }
}
exports.DependencyTwo = DependencyTwo;
class DependencyThree {
    print() {
        return 'dependencyThree';
    }
}
exports.DependencyThree = DependencyThree;
class DependencyFourToken {
    print() {
        return 'dependencyFour';
    }
}
exports.DependencyFourToken = DependencyFourToken;
class DependencyFive {
    print() {
        return 'dependencyFive';
    }
}
exports.DependencyFive = DependencyFive;
class MainClass {
    constructor(dependencyOne, dependencyTwo, dependencyThree, dependencyFour // Suppose a token
    ) {
        this.dependencyOne = dependencyOne;
        this.dependencyTwo = dependencyTwo;
        this.dependencyThree = dependencyThree;
        this.dependencyFour = dependencyFour;
    }
}
exports.MainClass = MainClass;
