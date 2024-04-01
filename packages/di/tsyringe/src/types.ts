import { InjectionToken } from 'tsyringe';
import { Type } from '@suites/types.common';

export interface TokenDescriptor {
  token: InjectionToken;
  multiple: boolean;
}

interface Transform<TIn, TOut> {
  transform: (incoming: TIn, ...args: never[]) => TOut;
}

export interface TransformDescriptor {
  token: InjectionToken;
  transform: InjectionToken<Transform<unknown, unknown>>;
  transformArgs: unknown[];
}

export type TSyringeReflectedInjectableIdentifier =
  | Type
  | string
  | symbol
  | { wrap: () => Type }
  | TransformDescriptor
  | TokenDescriptor;

export type MetadataReflector = typeof Reflect;

export type IdentifierMetadata = Record<'args', unknown[]>;
