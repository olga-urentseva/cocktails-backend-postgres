export class MyResponse<TStatusCode extends PropertyKey> extends Response {
  // @ts-expect-error https://github.com/microsoft/TypeScript/issues/15300
  private readonly ___weirdHackToPreserveGenericArgument: TStatusCode;

  constructor(
    body: string | null,
    init: Omit<ResponseInit, "status"> & {
      status: Extract<TStatusCode, number>;
    },
  ) {
    super(body, init);
  }
}
