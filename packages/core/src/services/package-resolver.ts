import { AutomockDependenciesAdapter } from '@automock/common';
import { PackageReader } from './package-reader';
import {
  AdapterResolutionFailureReason,
  AdapterResolutionFailure,
  NodeRequire,
  AutomockAdapter,
} from './types';

export class PackageResolver {
  public constructor(
    private readonly adapters: Record<AutomockAdapter, string>,
    private readonly require: NodeRequire,
    private readonly packageReader: PackageReader
  ) {}

  public resolveCorrespondingAdapter(): AutomockDependenciesAdapter | never {
    const adapters = Object.keys(this.adapters);

    const automockAdapterPath = this.packageReader.resolveAutomockAdapter();

    if (automockAdapterPath) {
      return this.resolveAutomockAdapter(automockAdapterPath);
    }

    const adapterName = adapters.find((resolverName: string) =>
      this.moduleIsAvailable(this.adapters[resolverName])
    );

    if (!adapterName) {
      throw new AdapterResolutionFailure(
        AdapterResolutionFailureReason.NO_COMPATIBLE_ADAPTER_FOUND
      );
    }

    return this.resolveAutomockAdapter(adapterName);
  }

  private resolveAutomockAdapter(
    adapterName: AutomockAdapter
  ): AutomockDependenciesAdapter | never {
    const adapter = this.require.require(this.adapters[adapterName]);

    if (!Object.prototype.hasOwnProperty.call(adapter, 'default')) {
      throw new AdapterResolutionFailure(AdapterResolutionFailureReason.NO_DEFAULT_EXPORT);
    }

    return this.require.require(this.adapters[adapterName]).default as AutomockDependenciesAdapter;
  }

  private moduleIsAvailable(path: string): boolean {
    try {
      this.require.resolve(path);
      return true;
    } catch (e) {
      return false;
    }
  }
}
