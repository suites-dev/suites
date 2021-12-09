import { JestSpecBuilder } from './jest-spec-builder';
import { Type } from '@automock/common';
import { mock } from 'jest-mock-extended';

export default (target: Type): JestSpecBuilder => new JestSpecBuilder(target, mock);
