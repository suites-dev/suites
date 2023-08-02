import { Type } from '@automock/types';
import { UndefinedOrNotFound, UndefinedOrNotFoundSymbol } from '@automock/common';
import { ForwardRefToken, NestJSInjectable } from './types';

export interface StrategyReturnType {
  typeOrToken: string | Type;
  value: Type | UndefinedOrNotFoundSymbol;
}

export interface PropertyReflectionStrategy {
  condition: (reflectedType: NestJSInjectable, type: NestJSInjectable) => boolean;
  exec: (reflectedType: NestJSInjectable, type: NestJSInjectable) => StrategyReturnType;
}

export const PropertyReflectionStrategies: ReadonlyArray<PropertyReflectionStrategy> = [
  {
    condition: (reflectedType: NestJSInjectable, type: NestJSInjectable): boolean => {
      return typeof type === 'object' && 'forwardRef' in type;
    },
    exec: (reflectedType: NestJSInjectable, type: NestJSInjectable) => {
      const forwardRefToken: string | Type | undefined = (type as ForwardRefToken).forwardRef();

      if (typeof forwardRefToken === 'undefined') {
        throw new Error('Token is undefined');
      }

      if (typeof forwardRefToken === 'string') {
        return {
          typeOrToken: forwardRefToken as string,
          value: typeof type === 'undefined' ? UndefinedOrNotFound : (type as Type),
        };
      }

      return {
        typeOrToken: forwardRefToken as Type,
        value: forwardRefToken as Type,
      };
    },
  },
  {
    condition: (reflectedType: undefined, type: NestJSInjectable): boolean => {
      return !reflectedType && typeof type === 'string';
    },
    exec: (reflectedType: NestJSInjectable, type: string) => {
      return {
        typeOrToken: type,
        value: UndefinedOrNotFound,
      };
    },
  },
  {
    condition: (reflectedType: undefined, type: Type): boolean => {
      return !reflectedType && typeof type !== 'string';
    },
    exec: (reflectedType: NestJSInjectable, type: Type) => {
      return {
        typeOrToken: type,
        value: !type ? UndefinedOrNotFound : type,
      };
    },
  },
  {
    condition: (reflectedType: Type, type: string): boolean => {
      return typeof type === 'string';
    },
    exec: (reflectedType: Type, type: string) => {
      return {
        typeOrToken: type,
        value: reflectedType,
      };
    },
  },
  {
    condition: (reflectedType: undefined, type: undefined): boolean => {
      return !reflectedType && !type;
    },
    exec: () => {
      throw new Error(`Failed`);
    },
  },
];
