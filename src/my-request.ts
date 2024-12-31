import { type AnyZodObject, z, type ZodEffects, ZodTypeAny } from "zod";

export class MyRequest<
  TSchemas extends {
    queryParams?:
      | AnyZodObject
      | ZodEffects<AnyZodObject, unknown, unknown>
      | undefined;
    params?:
      | AnyZodObject
      | ZodEffects<AnyZodObject, unknown, unknown>
      | undefined;
    // body?: ZodTypeAny;
  },
> {
  constructor(
    public readonly params: TSchemas["params"] extends infer R
      ? R extends ZodTypeAny
        ? z.infer<R>
        : undefined
      : never,
    public readonly queryParams: TSchemas["queryParams"] extends infer R
      ? R extends ZodTypeAny
        ? z.infer<R>
        : undefined
      : never,
  ) {}
}
