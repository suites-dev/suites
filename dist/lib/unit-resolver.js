"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitResolver = void 0;
require("reflect-metadata");
const mock_resolver_1 = require("./mock-resolver");
class UnitResolver {
    constructor(reflector, mockFn, targetClass) {
        this.reflector = reflector;
        this.mockFn = mockFn;
        this.targetClass = targetClass;
        this.dependencies = new Map();
        this.depNamesToMocks = new Map();
        this.dependencies = this.reflector.reflectDependencies(targetClass);
    }
    mock(dependency) {
        return {
            using: (mockImplementation) => {
                this.depNamesToMocks.set(dependency, this.mockFn(mockImplementation));
                return this;
            },
        };
    }
    compile() {
        const deps = this.mockUnMockedDependencies();
        const values = Array.from(deps.values());
        return {
            unit: new this.targetClass(...values),
            unitRef: new mock_resolver_1.MockResolver(deps),
        };
    }
    mockUnMockedDependencies() {
        const map = new Map();
        for (const [key, dependency] of this.dependencies.entries()) {
            const ref = typeof key === 'object' && 'forwardRef' in key ? key.forwardRef() : key;
            const overriddenDep = this.depNamesToMocks.get(ref);
            const mock = overriddenDep ? overriddenDep : this.mockFn();
            map.set(ref, mock);
        }
        return map;
    }
}
exports.UnitResolver = UnitResolver;
