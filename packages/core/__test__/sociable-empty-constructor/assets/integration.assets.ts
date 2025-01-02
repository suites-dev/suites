import isEqual from 'lodash.isequal';
import type {
  DependencyInjectionAdapter,
  ClassInjectable,
  IdentifierMetadata,
  InjectableRegistry,
  WithMetadata,
} from '@suites/types.di';
import type { Type } from '@suites/types.common';
import { normalizeIdentifier } from '../../../src/normalize-identifier.static';
import {
  TestService,
  TestDependService,
  TestSociableService,
  testServiceRegistry,
  emptyRegistry,
} from './injectable-registry.fixture';

const registryToClass: Map<Type, InjectableRegistry> = new Map<Type, InjectableRegistry>([
  [TestService, testServiceRegistry],
  [TestDependService, emptyRegistry],
  [TestSociableService, emptyRegistry],
]);

export const FakeAdapter: DependencyInjectionAdapter = {
  inspect: (targetClass: Type) => {
    return {
      list: () => {
        return registryToClass.get(targetClass)!.list();
      },
      resolve(
        identifier: Type | string,
        metadata?: IdentifierMetadata
      ): ClassInjectable | undefined {
        return registryToClass
          .get(targetClass)!
          .list()
          .find((injectable: WithMetadata<never>) => {
            const subject = normalizeIdentifier(identifier, metadata as never);
            const toFind = normalizeIdentifier(injectable.identifier, injectable.metadata);

            return isEqual(toFind, subject);
          });
      },
    };
  },
};
