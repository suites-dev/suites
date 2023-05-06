import 'reflect-metadata';
import { DependenciesReflector } from '@automock/core';
import { TokensReflector } from './token-reflector.service';
import { ReflectorFactory } from './reflector.service';

const DependenciesReflector: DependenciesReflector = ((reflect, tokensReflector) =>
  ReflectorFactory(reflect, tokensReflector))(Reflect, TokensReflector);

export = DependenciesReflector;
