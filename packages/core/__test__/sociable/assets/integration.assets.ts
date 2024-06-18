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
  apiServiceRegistry,
  databaseServiceRegistry,
  userApiServiceRegistry,
  userDalRegistry,
  userDigestServiceRegistry,
  userServiceRegistry,
  emptyRegistry,
  HttpClient,
  TestLogger,
  UserVerificationService,
  ApiService,
  DatabaseService,
  UserDigestService,
  UserApiService,
  UserDal,
  UserService,
  httpClientRegistry,
} from './injectable-registry.fixture';

const registryToClass: Map<Type, InjectableRegistry> = new Map<Type, InjectableRegistry>([
  [HttpClient, emptyRegistry],
  [TestLogger, emptyRegistry],
  [UserVerificationService, emptyRegistry],
]);

registryToClass.set(ApiService, apiServiceRegistry);
registryToClass.set(HttpClient, httpClientRegistry);
registryToClass.set(DatabaseService, databaseServiceRegistry);
registryToClass.set(UserDigestService, userDigestServiceRegistry);
registryToClass.set(UserApiService, userApiServiceRegistry);
registryToClass.set(UserDal, userDalRegistry);
registryToClass.set(UserService, userServiceRegistry);

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
