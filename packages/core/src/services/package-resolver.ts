import { AutomockDependenciesAdapter } from '@automock/common';
import { PackageReader } from './package-reader';
import { AutomockAdapter } from '../main';
import { AdapterResolvingFailureReason, AdapterResolvingFailure, NodeRequire } from './types';

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
      this.packageIsAvailable(this.adapters[resolverName])
    );

    if (!adapterName) {
      throw new AdapterResolvingFailure(AdapterResolvingFailureReason.NO_COMPATIBLE_ADAPTER_FOUND);
    }

    return this.resolveAutomockAdapter(adapterName);
  }

  private resolveAutomockAdapter(
    adapterName: AutomockAdapter
  ): AutomockDependenciesAdapter | never {
    const adapter = this.require.require(this.adapters[adapterName]);

    if (!Object.prototype.hasOwnProperty.call(adapter, 'default')) {
      throw new AdapterResolvingFailure(AdapterResolvingFailureReason.NO_DEFAULT_EXPORT);
    }

    return this.require.require(this.adapters[adapterName]).default as AutomockDependenciesAdapter;
  }

  private packageIsAvailable(path: string): boolean {
    try {
      this.require.resolve(path);
      return true;
    } catch (e) {
      return false;
    }
  }
}
