import { ClassInjectable } from '@automock/common';
import { Type } from '@automock/types';
import { PROPERTY_DEPS_METADATA } from '@nestjs/common/constants';
import { MetadataReflector, NestJSInjectable, ReflectedProperty } from './types';
import { PropertyReflectionStrategy } from './property-reflection-strategies.static';

export type ClassPropsReflector = ReturnType<typeof ClassPropsReflector>;

export function ClassPropsReflector(
  reflector: MetadataReflector,
  reflectionStrategies: ReadonlyArray<PropertyReflectionStrategy>
) {
  function reflectInjectables(targetClass: Type): ClassInjectable<never>[] {
    const classProperties = reflectProperties(targetClass);
    const classInstance = Object.create(targetClass.prototype);

    return classProperties.map(({ key, type }) => {
      const reflectedType = reflector.getMetadata(
        'design:type',
        classInstance,
        key
      ) as NestJSInjectable;

      if (!reflectedType && !type) {
        throw new Error(`
        Automock encountered an error while attempting to detect a token or type for the dependency for property '${key}' in the class '${targetClass.name}'.
        This issue is commonly caused by either improper decoration of the property or a problem during the reflection of the parameter type.
        In some cases, this error may arise due to circular dependencies. If this is the case, please ensure that the circular dependency
        is resolved, or consider using 'forwardRef()' to address it.`);
      }

      for (const strategy of reflectionStrategies) {
        if (strategy.condition(reflectedType, type)) {
          const result = strategy.exec(reflectedType, type);
          return { ...result, type: 'PROPERTY', property: { key } } as ClassInjectable<never>;
        }
      }

      return {
        type: 'PROPERTY',
        identifier: type as Type,
        value: type as Type,
        property: { key },
      } as ClassInjectable;
    });
  }

  function reflectProperties(targetClass: Type): ReflectedProperty[] {
    return reflector.getMetadata(PROPERTY_DEPS_METADATA, targetClass) || [];
  }

  return { reflectInjectables };
}
