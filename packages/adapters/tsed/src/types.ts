import { Type } from '@automock/types';

export type ForwardRefToken = { forwardRef: () => Type };
export type CustomInjectableToken = ForwardRefToken | string;
export type NestJSInjectable = Type | CustomInjectableToken;

export type MetadataReflector = typeof Reflect;

export interface ReflectedProperty {
  key: string;
  type: NestJSInjectable;
}
