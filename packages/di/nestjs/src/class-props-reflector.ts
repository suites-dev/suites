import type { ClassInjectable, InjectableReflectedType } from '@suites/types.di';
import { UndefinedDependencyError } from '@suites/types.di';
import type { Type } from '@suites/types.common';
import { PROPERTY_DEPS_METADATA } from '@nestjs/common/constants';
import type { MetadataReflector, ReflectedProperty } from './types';
import type { PropertyReflectionStrategy } from './property-reflection-strategies.static';

export type ClassPropsReflector = ReturnType<typeof ClassPropsReflector>;

export function ClassPropsReflector(
  reflector: MetadataReflector,
  reflectionStrategies: ReadonlyArray<PropertyReflectionStrategy>
) {
  function reflectInjectables(targetClass: Type): ClassInjectable[] {
    const classProperties = reflectProperties(targetClass);
    const classInstance = Object.create(targetClass.prototype);

    return classProperties.map(({ key, type: reflectedValue }) => {
      const reflectedType = reflector.getMetadata(
        'design:type',
        classInstance,
        key
      ) as InjectableReflectedType;

      if (!reflectedType && !reflectedValue) {
        throw new UndefinedDependencyError(`Suites encountered an error while attempting to detect a token or type for the dependency for property '${key}' in the class '${targetClass.name}'.
This issue is commonly caused by either improper decoration of the property or a problem during the reflection of the parameter type.
In some cases, this error may arise due to circular dependencies. If this is the case, please ensure that the circular dependency
is resolved, or consider using 'forwardRef()' to address it.`);
      }

      for (const strategy of reflectionStrategies) {
        if (strategy.condition(reflectedType, reflectedValue)) {
          const result = strategy.exec(reflectedType, reflectedValue);
          return { ...result, type: 'PROPERTY', property: { key } } as ClassInjectable;
        }
      }

      return {
        type: 'PROPERTY',
        identifier: reflectedValue as Type,
        value: reflectedValue as Type,
        property: { key },
      } as ClassInjectable;
    });
  }

  function reflectProperties(targetClass: Type): ReflectedProperty[] {
    return reflector.getMetadata(PROPERTY_DEPS_METADATA, targetClass) || [];
  }

  return { reflectInjectables };
}
