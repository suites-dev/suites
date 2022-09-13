"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spec = void 0;
const jest_mock_extended_1 = require("jest-mock-extended");
const unit_resolver_1 = require("./unit-resolver");
const reflector_service_1 = require("./reflector.service");
class Spec {
    /**
     * Create new unit builder
     * @param targetClass
     * @return UnitResolver
     */
    static create(targetClass) {
        const reflector = new reflector_service_1.ReflectorService(Reflect);
        return new unit_resolver_1.UnitResolver(reflector, jest_mock_extended_1.mock, targetClass);
    }
}
exports.Spec = Spec;
