import { InjectableIdentifier } from '@suites/common';

export function normalizeIdentifier(
  identifier: InjectableIdentifier,
  metadata?: unknown
): { identifier: InjectableIdentifier; metadata?: unknown } {
  if (metadata) {
    return Object.assign({ identifier }, { metadata });
  }

  return { identifier };
}
