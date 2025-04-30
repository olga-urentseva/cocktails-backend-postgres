import { z } from "hono-zod-openapi-patched";

import { MyRequest } from "../my-request";
import type { IGetCocktailUseCase } from "../services/get-cocktail-use-case";
import { Controller } from "../../lib/controller";
import { MyResponse } from "../my-response";

export class GetCocktailController extends Controller {
  constructor(private readonly getCocktailUseCase: IGetCocktailUseCase) {
    super();
  }

  public readonly request = {
    paramsSchema: z.object({
      id: z.string().openapi({
        param: {
          name: "id",
          in: "path",
        },
        example: "ghkrhlvwkvledh6743",
      }),
    }),
  };

  public readonly responses = {
    200: {
      description: "Get an information about specific cocktail",
      content: {
        "application/json": {
          schema: z
            .object({
              cocktail: z.object({
                id: z.string().openapi({
                  example: "ghkrhlvwkvledh6743",
                }),
                name: z.string().openapi({
                  example: "Cocktail Name",
                }),
                instruction: z.string().openapi({
                  example: "blah blah",
                }),
                pictureURL: z.string().openapi({
                  // Note: Changed from pictureUrl to match your return type
                  example: "https//",
                }),
                glass: z.string().openapi({
                  example: "glass",
                }),
                isAlcoholic: z.boolean().openapi({
                  example: true,
                }),
                credits: z.string().nullable().openapi({
                  example: "Name",
                }),
              }),
              ingredients: z.array(
                z.object({
                  id: z.string().openapi({
                    example: "123",
                  }),
                  name: z.string().openapi({
                    example: "Ingredient Name",
                  }),
                  measure: z.string().nullable().openapi({
                    example: "1 oz",
                  }),
                })
              ),
            })
            .nullable(),
        },
      },
    },
    404: {
      description: "Cocktail not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({
              example: "Cocktail not found",
            }),
          }),
        },
      },
    },
  };

  async handle(
    request: MyRequest<typeof this.request>
  ): Promise<MyResponse<keyof GetCocktailController["responses"]>> {
    const id = request.paramsSchema.id;
    const result = await this.getCocktailUseCase.execute(id);
    if (!result) {
      return new MyResponse(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new MyResponse(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
