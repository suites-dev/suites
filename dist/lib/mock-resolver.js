"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockResolver = void 0;
class MockResolver {
    constructor(depNamesToMocks) {
        this.depNamesToMocks = depNamesToMocks;
    }
    get(type) {
        return this.depNamesToMocks.get(type);
    }
}
exports.MockResolver = MockResolver;
