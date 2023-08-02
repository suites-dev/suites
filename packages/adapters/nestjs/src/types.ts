import { Type } from '@automock/types';

export type ForwardRefToken = { forwardRef: () => Type | string | undefined };
export type CustomInjectableToken = ForwardRefToken | string | Type;
export type NestJSInjectable = Type | CustomInjectableToken | undefined;

export type MetadataReflector = typeof Reflect;

export interface ReflectedProperty {
  key: string;
  type: NestJSInjectable;
}
