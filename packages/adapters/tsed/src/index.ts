import "reflect-metadata";
import { TsEDDependenciesReflector } from "./dependencies-reflector";
import { ClassPropsReflector } from "./class-props-reflector";
import { ClassCtorReflector } from "./class-ctor-reflector";
import { ParamsTokensReflector } from "./params-token-resolver";

const dependenciesReflector = new TsEDDependenciesReflector(
  new ClassPropsReflector(Reflect),
  new ClassCtorReflector(Reflect, ParamsTokensReflector)
);

export = dependenciesReflector;
