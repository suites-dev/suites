"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const dependencies_mocker_1 = require("../src/services/dependencies-mocker");
const integration_assets_1 = require("./integration.assets");
describe('Builder Factory Integration Test', () => {
    let underTest;
    // It's a function that mocks the mock function, don't be confused by the name
    const mockFunctionMockOfBuilder = jest.fn(() => '__MOCKED_FROM_BUILDER__');
    const mockFunctionMockOfMocker = jest.fn(() => '__MOCKED_FROM_MOCKER__');
    const reflectorMock = {
        reflectDependencies: () => {
            return new Map([
                [integration_assets_1.DependencyOne, integration_assets_1.DependencyOne],
                [integration_assets_1.DependencyTwo, integration_assets_1.DependencyTwo],
                [integration_assets_1.DependencyThree, integration_assets_1.DependencyThree],
                ['DEPENDENCY_FOUR_TOKEN', integration_assets_1.DependencyFourToken],
                [integration_assets_1.DependencyFive, integration_assets_1.DependencyFive],
            ]);
        },
    };
    const dependenciesMockerMock = new dependencies_mocker_1.DependenciesMocker(reflectorMock, mockFunctionMockOfMocker);
    beforeAll(() => {
        underTest = src_1.BuilderFactory.create(mockFunctionMockOfBuilder, dependenciesMockerMock)(integration_assets_1.MainClass);
    });
    describe('creating a testbed builder with some mock overrides', () => {
        let unitTestBed;
        beforeAll(() => {
            unitTestBed = underTest
                .mock(integration_assets_1.DependencyOne)
                .using({
                print: () => 'dependency-one-overridden',
            })
                .mock(integration_assets_1.DependencyTwo)
                .using({
                print: () => 'dependency-two-overridden',
            })
                .mock('DEPENDENCY_FOUR_TOKEN')
                .using({
                print: () => 'dependency-four-overridden',
            })
                .compile();
        });
        test('return an instance of a unit test bed with corresponding properties', () => {
            expect(unitTestBed.unit).toBeDefined();
            expect(unitTestBed.unitRef).toBeDefined();
        });
        test('return an instance of the unit and a unit reference', () => {
            expect(unitTestBed.unit).toBeInstanceOf(integration_assets_1.MainClass);
            expect(unitTestBed.unitRef).toBeInstanceOf(src_1.UnitReference);
        });
        describe('override the dependencies from the builder, and leave the rest for the dependencies mocked', () => {
            it.each([
                [integration_assets_1.DependencyOne.name, '__MOCKED_FROM_BUILDER__', integration_assets_1.DependencyOne],
                [integration_assets_1.DependencyTwo.name, '__MOCKED_FROM_BUILDER__', integration_assets_1.DependencyTwo],
                [integration_assets_1.DependencyThree.name, '__MOCKED_FROM_MOCKER__', integration_assets_1.DependencyThree],
                ['DEPENDENCY_FOUR_TOKEN', '__MOCKED_FROM_BUILDER__', 'DEPENDENCY_FOUR_TOKEN'],
                [integration_assets_1.DependencyFive.name, '__MOCKED_FROM_MOCKER__', integration_assets_1.DependencyFive],
            ])('should return a stubbed instance for %p, mocked from %p', (name, expectedResult, dependency) => {
                const stubbedInstance = unitTestBed.unitRef.get(dependency);
                expect(stubbedInstance).toEqual(expectedResult);
            });
        });
    });
});
