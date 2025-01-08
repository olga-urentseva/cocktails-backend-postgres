import { z } from "zod";

import { Controller } from "../../lib/controller";
import { IGetCollectionsUseCase } from "../services/get-collections-use-case";

import { MyResponse } from "../my-response";

export class GetCollectionsController extends Controller {
  constructor(private readonly getCollectionsUseCase: IGetCollectionsUseCase) {
    super();
  }

  public readonly requestSchemas = {};

  public readonly responses = {
    200: {
      description: "Get collections",
      content: {
        "application/json": {
          schema: z
            .array(
              z
                .object({
                  name: z.string(),
                  id: z.string(),
                  description: z.string(),
                  pictureURL: z.string(),
                })
                .strict()
            )
            .openapi({
              example: [
                {
                  name: "spring",
                  id: "llNO7ABV5rRP3PMERSVLV",
                  description: "spring is da town",
                  pictureURL: "https://",
                },
              ],
            }),
        },
      },
    },
  };

  async handle(): Promise<
    MyResponse<keyof GetCollectionsController["responses"]>
  > {
    const result = await this.getCollectionsUseCase.execute();

    return new MyResponse(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
