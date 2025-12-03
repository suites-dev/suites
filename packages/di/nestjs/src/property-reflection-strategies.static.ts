import type { Type } from '@suites/types.common';
import type {
  InjectableIdentifier,
  InjectableReflectedType,
  InjectableFinalValue,
} from '@suites/types.di';
import { UndefinedDependency } from '@suites/types.di';
import type { ForwardRefToken, NestInjectableIdentifier } from './types';

export interface StrategyReturnType {
  identifier: InjectableIdentifier;
  value: InjectableFinalValue;
}

export interface PropertyReflectionStrategy {
  condition: (
    reflectedType: InjectableReflectedType,
    identifier: NestInjectableIdentifier
  ) => boolean;
  exec: (
    reflectedType: InjectableReflectedType,
    identifier: NestInjectableIdentifier
  ) => StrategyReturnType;
}

export const PropertyReflectionStrategies: ReadonlyArray<PropertyReflectionStrategy> = [
  {
    condition: (
      _reflectedType: InjectableReflectedType,
      identifier: NestInjectableIdentifier
    ): boolean => {
      return typeof identifier === 'object' && 'forwardRef' in identifier;
    },
    exec: (reflectedType: InjectableReflectedType, identifier: NestInjectableIdentifier) => {
      const forwardRefToken = (identifier as ForwardRefToken).forwardRef();

      if (typeof forwardRefToken === 'undefined') {
        throw new Error('Token is undefined');
      }

      if (typeof forwardRefToken === 'string') {
        return {
          identifier: forwardRefToken as string,
          value: typeof identifier === 'undefined' ? UndefinedDependency : (identifier as Type),
        };
      }

      return {
        identifier: forwardRefToken as Type,
        value: typeof reflectedType === 'undefined' ? UndefinedDependency : forwardRefToken,
      };
    },
  },
  {
    condition: (reflectedType: undefined, identifier: NestInjectableIdentifier): boolean => {
      return !reflectedType && typeof identifier === 'string';
    },
    exec: (_reflectedType: InjectableReflectedType, type: string) => {
      return {
        identifier: type,
        value: UndefinedDependency,
      };
    },
  },
  {
    condition: (reflectedType: undefined, identifier: Type): boolean => {
      return !reflectedType && typeof identifier !== 'string';
    },
    exec: (reflectedType: InjectableReflectedType, type: Type) => {
      return {
        identifier: type,
        value: UndefinedDependency,
      };
    },
  },
  {
    condition: (_reflectedType: InjectableReflectedType, identifier: string): boolean => {
      return typeof identifier === 'string';
    },
    exec: (reflectedType: InjectableReflectedType, identifier: string) => {
      return {
        identifier,
        value: reflectedType as InjectableFinalValue,
      };
    },
  },
  {
    condition: (
      reflectedType: undefined,
      identifier: NestInjectableIdentifier | undefined
    ): boolean => {
      return !reflectedType && !identifier;
    },
    exec: () => {
      throw new Error('Failed');
    },
  },
];
