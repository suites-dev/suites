import { UnitReference } from '@automock/core';
import { TestBed } from '@automock/sinon';
import {
  ClassThatIsNotInjected,
  Foo,
  Logger,
  NestJSTestClass,
  TestClassFour,
  TestClassOne,
  TestClassThree,
  TestClassTwo,
} from './e2e-assets';
import { SinonStubbedInstance } from 'sinon';
import { expect } from 'chai';
import { before } from 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

describe('Automock Sinon / NestJS E2E Test', () => {
  let unit: NestJSTestClass;
  let unitRef: UnitReference;

  before(() => {
    const { unitRef: ref, unit: underTest } = TestBed.create<NestJSTestClass>(NestJSTestClass)
      .mock(TestClassOne)
      .using({
        async foo(): Promise<string> {
          return 'foo-from-test';
        },
      })
      .mock<string>('PRIMITIVE_VALUE')
      .using('arbitrary-string')
      .mock('UNDEFINED')
      .using({ method: () => 456 })
      .mock<Logger>('LOGGER')
      .using({ log: () => 'baz-from-test' })
      .compile();

    unitRef = ref;
    unit = underTest;
  });

  describe('when compiling the builder and turning into testing unit', () => {
    it('then the unit should an instance of the class under test', () => {
      expect(unit).to.be.instanceof(NestJSTestClass);
    });

    it('then successfully resolve the dependencies of the tested classes', () => {
      expect(() => unitRef.get(TestClassOne).foo).not.to.be.undefined;
      expect(() => unitRef.get(TestClassTwo)).not.to.be.undefined;
      expect(() => unitRef.get(Foo)).not.to.be.undefined;
      expect(() => unitRef.get<{ log: () => void }>('LOGGER')).not.to.be.undefined;
      expect(() => unitRef.get(TestClassThree)).not.to.be.undefined;
      expect(() => unitRef.get('UNDEFINED_SECOND')).not.to.be.undefined;
      expect(() => unitRef.get(TestClassFour)).not.to.be.undefined;
    });

    it('then do not return the actual reflected dependencies of the injectable class', () => {
      // Indeed, they all need to be overwritten
      expect(() => unitRef.get(TestClassOne)).not.to.be.instanceof(TestClassOne);
      expect(() => unitRef.get(TestClassTwo)).not.to.be.instanceof(TestClassTwo);
    });

    it('should hard-mock the implementation of TestClassOne using the "foo" (partial impl function)', async () => {
      // Create a Sinon stubbed instance of TestClassOne
      const testClassOne: SinonStubbedInstance<TestClassOne> = unitRef.get(TestClassOne);
      testClassOne.foo.withArgs(true).resolves('foo-from-test');

      await expect(testClassOne.foo(true)).to.eventually.equal('foo-from-test');
      await expect(testClassOne.foo(false)).to.eventually.equal('foo-from-test');
    });

    it('then mock the undefined reflected values and tokens', () => {
      const testClassFour: SinonStubbedInstance<TestClassFour> = unitRef.get(TestClassFour);
      const undefinedValue: SinonStubbedInstance<{ method: () => number }> = unitRef.get<{
        method: () => number;
      }>('UNDEFINED');

      testClassFour.doSomething.returns('mocked');

      expect(testClassFour.doSomething()).to.equal('mocked');
      expect(undefinedValue.method()).to.equal(456);
    });

    it('then throw an error when trying to resolve not existing dependency', () => {
      expect(() => unitRef.get(ClassThatIsNotInjected)).to.throw;
    });
  });
});
