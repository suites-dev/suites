import type { ClassInjectable } from '@suites/types.di';
import type { Type } from '@suites/types.common';
import type { interfaces } from 'inversify';

export interface InversifyInjectableMetadata<T extends interfaces.ServiceIdentifier<T> = never>
  extends interfaces.Metadata {
  key: 'inject' | 'multi_inject' | string;
  value: T | unknown | LazyServiceIdentifierToken;
}

export type LazyServiceIdentifierToken = { unwrap: () => Type | string | undefined };

export type MetadataReflector = typeof Reflect;

export type InversifyInjectableIdentifierMetadata = ClassInjectable<Record<string | symbol, never>>;

export const INVERSIFY_PRESERVED_KEYS: readonly string[] = ['inject', 'multi_inject'] as const;

export type IdentifierMetadata = Record<string | symbol, unknown>;
