import { ClassPropsInjectables } from '@automock/common';
import { Type } from '@automock/types';
import { PROPERTY_DEPS_METADATA } from '@nestjs/common/constants';
import { MetadataReflector, NestJSInjectable, ReflectedProperty } from './types';
import { PropertyReflectionStrategy } from './property-reflection-strategies.static';

export type ClassPropsReflector = ReturnType<typeof ClassPropsReflector>;

export function ClassPropsReflector(
  reflector: MetadataReflector,
  reflectionStrategies: ReadonlyArray<PropertyReflectionStrategy>
) {
  function reflectInjectables(targetClass: Type): ClassPropsInjectables {
    const classProperties = reflectProperties(targetClass)(reflector);
    const classInstance = Object.create(targetClass.prototype);

    return classProperties.map(({ key, type }) => {
      const reflectedType = reflector.getMetadata(
        'design:type',
        classInstance,
        key
      ) as NestJSInjectable;

      if (!reflectedType && !type) {
        throw new Error(
          `Automock has failed to reflect '${targetClass.name}.${key}' property, did you forget to inject it using @Inject()?`
        );
      }

      for (const strategy of reflectionStrategies) {
        if (strategy.condition(reflectedType, type)) {
          const result = strategy.exec(reflectedType, type);
          return { ...result, property: key };
        }
      }

      return {
        property: key,
        typeOrToken: type as Type,
        value: type as Type,
      };
    });
  }

  function reflectProperties(
    targetClass: Type
  ): (reflector: MetadataReflector) => ReflectedProperty[] {
    return (reflector: MetadataReflector) =>
      reflector.getMetadata(PROPERTY_DEPS_METADATA, targetClass) || [];
  }

  return { reflectInjectables };
}
