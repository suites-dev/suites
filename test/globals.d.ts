import { SinonMockFn, SinonMockOverrides } from '@automock/common';

declare module '@automock/unit' {
  export declare type MockOf<T> = SinonMockFn<T>;
}

declare module '@automock/common' {
  export declare type ImplementationFunctions<T> = SinonMockOverrides<T>;
}
