import { z } from "zod";
import type { ZodType, ZodTypeAny, ZodEffects, AnyZodObject } from "zod";

export class MyRequest<
  TSchemas extends {
    queryParamsSchema?:
      | AnyZodObject
      | ZodEffects<AnyZodObject, unknown, unknown>
      | undefined;
    body?: {
      content: Record<string, { schema: ZodType<unknown> }>;
    };
    paramsSchema?:
      | AnyZodObject
      | ZodEffects<AnyZodObject, unknown, unknown>
      | undefined;

    headersSchema?:
      | AnyZodObject
      | ZodEffects<AnyZodObject, unknown, unknown>
      | undefined;
  },
> {
  constructor(
    public readonly paramsSchema: TSchemas["paramsSchema"] extends infer R
      ? R extends ZodTypeAny
        ? z.infer<R>
        : undefined
      : never,
    public readonly queryParamsSchema: TSchemas["queryParamsSchema"] extends infer R
      ? R extends ZodTypeAny
        ? z.infer<R>
        : undefined
      : never,
    public readonly body: {
      [K in keyof NonNullable<TSchemas["body"]>["content"]]: {
        mediaType: K;
        data: z.infer<
          NonNullable<TSchemas["body"]>["content"][K] extends {
            schema: ZodType<unknown>;
          }
            ? NonNullable<TSchemas["body"]>["content"][K]["schema"]
            : never
        >;
      };
    }[keyof NonNullable<TSchemas["body"]>["content"]],
    // public readonly body: NonNullable<TSchemas["body"]> extends {
    //   content: Record<string, { schema: infer R }>;
    // }
    //   ? R extends ZodTypeAny
    //     ? z.infer<R>
    //     : undefined
    //   : never,

    public readonly headersSchema: TSchemas["headersSchema"] extends infer R
      ? R extends ZodTypeAny
        ? z.infer<R>
        : undefined
      : never
  ) {}
}
