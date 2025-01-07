import { Controller } from "../../lib/controller";
import { IGetIngredientsUseCase } from "../services/get-ingredients-use-case";
import { MyRequest } from "../my-request";
import { z } from "zod";
import { MyResponse } from "../my-response";

export class GetIngredientsController extends Controller {
  constructor(private readonly getIngredientsUseCase: IGetIngredientsUseCase) {
    super();
  }

  public readonly requestSchemas = {
    queryParams: z
      .object({
        prefix: z
          .string()
          .optional()
          .openapi({
            param: {
              name: "prefix",
              in: "query",
            },
            example: "mar",
          }),
      })
      .strict(),
  };

  public readonly responses = {
    200: {
      description: "Get ingredients by prefix",
      content: {
        "application/json": {
          schema: z
            .array(
              z
                .object({
                  name: z.string(),
                  id: z.string(),
                })
                .strict(),
            )
            .openapi({
              example: [
                {
                  name: "lime",
                  id: "llNO7ABV5rRP3PMERSVLV",
                },
                {
                  name: "lime juice",
                  id: "DpicaCuOdB_41Ldq0XRhK",
                },
              ],
            }),
        },
      },
    },
  };

  async handle(
    request: MyRequest<typeof this.requestSchemas>,
  ): Promise<MyResponse<keyof GetIngredientsController["responses"]>> {
    const result = await this.getIngredientsUseCase.execute(
      request.queryParams.prefix,
    );

    return new MyResponse(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
