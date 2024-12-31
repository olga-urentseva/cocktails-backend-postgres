import { MyRequest } from "../my-request";

import { Controller } from "../../lib/controller";
import { z } from "zod";
import { MyResponse } from "../my-response";
import { IGetCollectionUseCase } from "../services/get-collection-use-case";

export class GetCollectionController extends Controller {
  constructor(private readonly getCollectionUseCase: IGetCollectionUseCase) {
    super();
  }

  public readonly requestSchemas = {
    params: z.object({
      id: z.string().openapi({
        param: {
          name: "id",
          in: "path",
        },
        example: "spring",
      }),
    }),
  };

  public readonly responses = {
    200: {
      description: "Get an information about specific collection",
      content: {
        "application/json": {
          schema: z.object({
            id: z.string().openapi({
              example: "spring",
            }),
            name: z.string().openapi({
              example: "Collection Name",
            }),
            description: z.string().openapi({
              example: "blah blah blah what a cool collection",
            }),
            pictureUrl: z.string().openapi({
              // Note: Changed from pictureUrl to match your return type
              example: "https//",
            }),
          }),
        },
      },
    },
  };

  async handle(
    request: MyRequest<typeof this.requestSchemas>,
  ): Promise<MyResponse<keyof GetCollectionController["responses"]>> {
    const { id } = request.params;

    const result = await this.getCollectionUseCase.execute(id);

    return new MyResponse(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
