import type { InjectableIdentifier } from '@suites/types.di';

export function normalizeIdentifier(
  identifier: InjectableIdentifier,
  metadata: undefined | never = undefined
): { identifier: InjectableIdentifier; metadata?: never } {
  if (metadata) {
    return Object.assign({ identifier }, { metadata });
  }

  return { identifier };
}
