"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReflectorService = void 0;
class ReflectorService {
    constructor(reflector) {
        this.reflector = reflector;
    }
    reflectDependencies(targetClass) {
        const classDependencies = new Map();
        const types = this.reflectParamTypes(targetClass);
        const tokens = this.reflectParamTokens(targetClass);
        const duplicates = ReflectorService.findDuplicates([...types]).map((typeOrToken) => typeof typeOrToken === 'string' ? typeOrToken : typeOrToken.name);
        types.map((type, index) => {
            if (type.name === 'Object' || duplicates.includes(type.name)) {
                const token = ReflectorService.findToken(tokens, index);
                if (!token) {
                    if (type.name === 'Object') {
                        throw new Error(`'${targetClass.name}' is missing a token for the dependency at index [${index}], did you forget to inject it using @Inject()?`);
                    }
                    else {
                        throw new Error(`'${targetClass.name}' includes non-unique types/tokens dependencies`);
                    }
                }
                classDependencies.set(token, type);
            }
            else {
                classDependencies.set(type, type);
            }
        });
        return classDependencies;
    }
    reflectParamTokens(targetClass) {
        return this.reflector.getMetadata(ReflectorService.INJECTED_TOKENS_METADATA, targetClass) || [];
    }
    reflectParamTypes(targetClass) {
        return this.reflector.getMetadata(ReflectorService.PARAM_TYPES_METADATA, targetClass) || [];
    }
    static findToken(list, index) {
        var _a;
        const record = list.find((element) => element.index === index);
        return (_a = record === null || record === void 0 ? void 0 : record.param) !== null && _a !== void 0 ? _a : false;
    }
    static findDuplicates(typesOrToken) {
        const items = [...typesOrToken.sort()];
        let index = items.length;
        const duplicates = [];
        while (index--) {
            items[index] === items[index - 1] &&
                duplicates.indexOf(items[index]) == -1 &&
                duplicates.push(items[index]);
        }
        return duplicates;
    }
}
exports.ReflectorService = ReflectorService;
ReflectorService.INJECTED_TOKENS_METADATA = 'self:paramtypes';
ReflectorService.PARAM_TYPES_METADATA = 'design:paramtypes';
