import { TOKENIZED_CTOR_DEPS_METADATA } from '../constants';

/**
 * This decorator wires between an anonymous class dependency (most commonly
 * is when using interface/types or anonymous element like function or object)
 *
 * @example
 * class Service {
 *   constructor(@Token('Logger') private logger: Logger)
 * }
 *
 * @see https://github.com/omermorad/aromajs/tree/master/docs/decorators.md
 *
 * @param token {string}
 * @return ParameterDecorator
 */
export function Token(token: string): ParameterDecorator {
  return (target: string, propertyKey: string, index: number) => {
    const unknownType = Reflect.getMetadata(TOKENIZED_CTOR_DEPS_METADATA, target) || {};
    Reflect.defineMetadata(TOKENIZED_CTOR_DEPS_METADATA, { ...unknownType, [index]: token }, target);
  };
}
