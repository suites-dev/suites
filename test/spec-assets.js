"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestJSTestClass = exports.InvalidClass = exports.MainTestClass = exports.TestClassThree = exports.TestClassTwo = exports.TestClassOne = void 0;
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const src_1 = require("../src");
let TestClassOne = class TestClassOne {
    async foo(flag) {
        if (flag) {
            return Promise.resolve('foo-with-flag');
        }
        return Promise.resolve('foo');
    }
};
TestClassOne = __decorate([
    (0, src_1.Reflectable)()
], TestClassOne);
exports.TestClassOne = TestClassOne;
let TestClassTwo = class TestClassTwo {
    async bar() {
        return Promise.resolve('bar');
    }
};
TestClassTwo = __decorate([
    (0, src_1.Reflectable)()
], TestClassTwo);
exports.TestClassTwo = TestClassTwo;
let TestClassThree = class TestClassThree {
    baz() {
        return 'baz';
    }
};
TestClassThree = __decorate([
    (0, src_1.Reflectable)()
], TestClassThree);
exports.TestClassThree = TestClassThree;
let MainTestClass = class MainTestClass {
    constructor(testClassOne, testClassTwo, logger) {
        this.testClassOne = testClassOne;
        this.testClassTwo = testClassTwo;
        this.logger = logger;
    }
    async test() {
        const value = await this.testClassOne.foo(true);
        const value2 = await this.testClassTwo.bar();
        const value3 = this.logger.log();
        return `${value}-${value2}-${value3}`;
    }
};
MainTestClass = __decorate([
    (0, src_1.Reflectable)(),
    __param(2, (0, common_1.Inject)('LOGGER')),
    __metadata("design:paramtypes", [TestClassOne,
        TestClassTwo, Object])
], MainTestClass);
exports.MainTestClass = MainTestClass;
let InvalidClass = class InvalidClass {
    constructor(testClassOne, logger) {
        this.testClassOne = testClassOne;
        this.logger = logger;
    }
    async test() {
        const value = await this.testClassOne.foo(true);
        const value3 = this.logger.log();
        return `${value}-${value3}`;
    }
};
InvalidClass = __decorate([
    (0, src_1.Reflectable)(),
    __metadata("design:paramtypes", [TestClassOne, Object])
], InvalidClass);
exports.InvalidClass = InvalidClass;
let NestJSTestClass = class NestJSTestClass {
    constructor(testClassOne, testClassTwo, logger) {
        this.testClassOne = testClassOne;
        this.testClassTwo = testClassTwo;
        this.logger = logger;
    }
    async test() {
        const value = await this.testClassOne.foo(true);
        const value2 = await this.testClassTwo.bar();
        const value3 = this.logger.log();
        return `${value}-${value2}-${value3}`;
    }
};
NestJSTestClass = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)('LOGGER')),
    __metadata("design:paramtypes", [TestClassOne,
        TestClassTwo, Object])
], NestJSTestClass);
exports.NestJSTestClass = NestJSTestClass;
