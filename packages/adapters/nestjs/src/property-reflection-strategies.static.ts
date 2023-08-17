import { Type } from '@automock/types';
import {
  InjectableIdentifier,
  UndefinedDependency,
  UndefinedDependencySymbol,
} from '@automock/common';
import { ForwardRefToken, NestJSInjectable } from './types';

export interface StrategyReturnType {
  identifier: InjectableIdentifier;
  value: Type | UndefinedDependencySymbol;
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
          identifier: forwardRefToken as string,
          value: typeof type === 'undefined' ? UndefinedDependency : (type as Type),
        };
      }

      return {
        identifier: forwardRefToken as Type,
        value: typeof reflectedType === 'undefined' ? UndefinedDependency : forwardRefToken,
      };
    },
  },
  {
    condition: (reflectedType: undefined, type: NestJSInjectable): boolean => {
      return !reflectedType && typeof type === 'string';
    },
    exec: (reflectedType: NestJSInjectable, type: string) => {
      return {
        identifier: type,
        value: UndefinedDependency,
      };
    },
  },
  {
    condition: (reflectedType: undefined, type: Type): boolean => {
      return !reflectedType && typeof type !== 'string';
    },
    exec: (reflectedType: NestJSInjectable, type: Type) => {
      return {
        identifier: type,
        value: !type ? UndefinedDependency : type,
      };
    },
  },
  {
    condition: (reflectedType: Type, type: string): boolean => {
      return typeof type === 'string';
    },
    exec: (reflectedType: Type, type: string) => {
      return {
        identifier: type,
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
