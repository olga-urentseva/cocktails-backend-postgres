import type { AnyZodObject, ZodEffects, ZodType } from "zod";
import { MyRequest } from "../src/my-request";
import { MyResponse } from "../src/my-response";

// type ContentType =
//   | "application/json"
//   | "text/html"
//   | "text/plain"
//   | "application/xml"
//   | (string & {});

// type RequestBody = {
//   content: {
//     [K in ContentType]?: {
//       schema:
//         | AnyZodObject
//         | ZodEffects<AnyZodObject, unknown, unknown>
//         | undefined;
//     };
//   };
// };

export abstract class Controller {
  public abstract readonly request: {
    queryParamsSchema?:
      | AnyZodObject
      | ZodEffects<AnyZodObject, unknown, unknown>
      | undefined;
    paramsSchema?:
      | AnyZodObject
      | ZodEffects<AnyZodObject, unknown, unknown>
      | undefined;
    body?: {
      content: Record<string, { schema: ZodType<unknown> }>;
    };
    headersSchema?:
      | AnyZodObject
      | ZodEffects<AnyZodObject, unknown, unknown>
      | undefined;
  };

  public abstract readonly responses: Record<
    number,
    {
      description: string;
      headers?: AnyZodObject;
      // links?: LinksObject;
      content: Partial<
        Record<
          string,
          {
            schema: ZodType<unknown>;
          }
        >
      >;
    }
  >;
  public abstract handle(
    request: MyRequest<this["request"]>
  ):
    | Promise<MyResponse<keyof this["responses"]>>
    | MyResponse<keyof this["responses"]>;
}
