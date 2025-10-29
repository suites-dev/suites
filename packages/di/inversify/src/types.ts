import type { ClassInjectable } from '@suites/types.di';
import type { ClassElementMetadata } from '@inversifyjs/core';

export type InversifyClassElementMetadata = ClassElementMetadata;

export type InversifyInjectableIdentifierMetadata = ClassInjectable<Record<string | symbol, never>>;

export type IdentifierMetadata = Record<string | symbol, unknown>;
