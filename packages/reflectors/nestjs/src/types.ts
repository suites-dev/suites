import { Type } from '@automock/types';

export type ForwardRefToken = { forwardRef: () => Type };
export type CustomInjectableToken = ForwardRefToken | string;
export type ConstructorParam = Type | CustomInjectableToken;
