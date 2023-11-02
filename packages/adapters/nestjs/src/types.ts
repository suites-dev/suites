import { InjectableIdentifier, InjectableReflectedType } from '@automock/common';

export type ForwardRefToken = { forwardRef: () => InjectableReflectedType };
export type NestInjectableIdentifier = ForwardRefToken | InjectableIdentifier;

export type MetadataReflector = typeof Reflect;

export interface ReflectedProperty {
  key: string;
  type: NestInjectableIdentifier;
}
