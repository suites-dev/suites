export const SuitesErrorCode = {
  IDENTIFIER_NOT_FOUND: 'ER010',
  ADAPTER_NOT_FOUND: 'ER020',
  ADAPTER_ERROR: 'ER021',
  UNDEFINED_DEPENDENCY: 'ER30',
  UNDEFINED_TOKEN: 'ER31',
};

export type SuitesErrorCode = (typeof SuitesErrorCode)[keyof typeof SuitesErrorCode];

export class SuitesError extends Error {
  public constructor(
    public readonly code: SuitesErrorCode,
    title: string,
    message: string
  ) {
    super(`${title} (code ${code.toString()})\n${message}`);
    this.name = 'SuitesError';
  }
}
