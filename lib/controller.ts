import {
  type AnyZodObject,
  type ZodEffects,
  type ZodType,
  ZodTypeAny,
} from "zod";
import { MyRequest } from "../src/my-request";
import { MyResponse } from "../src/my-response";

export abstract class Controller {
  public abstract readonly requestSchemas: {
    queryParams?:
      | AnyZodObject
      | ZodEffects<AnyZodObject, unknown, unknown>
      | undefined;
    params?:
      | AnyZodObject
      | ZodEffects<AnyZodObject, unknown, unknown>
      | undefined;
    body?: ZodTypeAny;
    headers?:
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
          | "application/json"
          | "text/html"
          | "text/plain"
          | "application/xml"
          | (string & {}),
          {
            schema: ZodType<unknown>;
            // examples?: ExamplesObject;
            // example?: any;
            // encoding?: EncodingObject;
          }
        >
      >;
    }
  >;
  public abstract handle(
    request: MyRequest<this["requestSchemas"]>,
  ):
    | Promise<MyResponse<keyof this["responses"]>>
    | MyResponse<keyof this["responses"]>;
}
