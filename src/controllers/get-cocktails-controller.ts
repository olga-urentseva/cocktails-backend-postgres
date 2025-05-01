import { z } from "hono-zod-openapi-patched";
import { Controller } from "../../lib/controller";
import type { IGetCocktailsUseCase } from "../services/get-cocktails-use-case";
import { MyRequest } from "../my-request";
import { MyResponse } from "../my-response";

export class GetCocktailsController extends Controller {
  constructor(private readonly getCocktailsUseCase: IGetCocktailsUseCase) {
    super();
  }

  public readonly request = {
    queryParamsSchema: z
      .object({
        name: z
          .string()
          .optional()
          .openapi({
            param: {
              name: "name",
              in: "query",
            },
            example: "Margarita",
          }),
        isAlcoholic: z
          .enum(["true", "false"])
          .transform((value) => value === "true")
          .optional()
          .openapi({
            param: {
              name: "isAlcoholic",
              in: "query",
            },
            example: "false",
          }),
        "ingredients[]": z
          .array(z.string())
          .or(z.string().transform((str) => [str]))
          .optional()
          .openapi({
            param: {
              name: "ingredients[]",
              in: "query",
            },
            example: ["vodka", "lime"],
          }),
        collection: z
          .string()
          .optional()
          .openapi({
            param: {
              name: "collection",
              in: "query",
            },
            example: "classic",
          }),
        page: z.coerce
          .number()
          .optional()
          .default(1)
          .openapi({
            param: {
              name: "page",
              in: "query",
            },
            example: 1,
          }),
      })
      .strict()
      .transform(({ "ingredients[]": ingredients, ...obj }) => ({
        ...obj,
        ingredients,
      })),
  };

  public readonly responses = {
    200: {
      content: {
        "application/json": {
          schema: z
            .object({
              cocktails: z.array(
                z.object({
                  id: z.string().openapi({
                    example: "cocktail_123",
                  }),
                  name: z.string().openapi({
                    example: "Margarita",
                  }),
                  instruction: z.string().openapi({
                    example: "Mix tequila with lime juice and triple sec...",
                  }),
                  pictureURL: z.string().openapi({
                    example: "https://example.com/margarita.jpg",
                  }),
                  glass: z.string().openapi({
                    example: "Cocktail glass",
                  }),
                  isAlcoholic: z.boolean().openapi({
                    example: true,
                  }),
                  credits: z.string().nullable().openapi({
                    example: "Classic recipe",
                  }),
                })
              ),
              pagination: z.object({
                currentPage: z.number().openapi({
                  example: 1,
                }),
                pageSize: z.number().openapi({
                  example: 10,
                }),
                totalPages: z.number().openapi({
                  example: 5,
                }),
                totalItems: z.number().openapi({
                  example: 48,
                }),
              }),
            })
            .openapi({
              example: {
                cocktails: [
                  {
                    id: "cocktail_123",
                    name: "Margarita",
                    instruction:
                      "Mix tequila with lime juice and triple sec...",
                    pictureURL: "https://example.com/margarita.jpg",
                    glass: "Cocktail glass",
                    isAlcoholic: true,
                    credits: "Classic recipe",
                  },
                ],
                pagination: {
                  currentPage: 1,
                  pageSize: 10,
                  totalPages: 5,
                  totalItems: 48,
                },
              },
            }),
        },
      },
      description: "Get list of cocktails",
    },
  };

  async handle(
    request: MyRequest<typeof this.request>
  ): Promise<MyResponse<keyof GetCocktailsController["responses"]>> {
    const result = await this.getCocktailsUseCase.execute(
      request.queryParamsSchema,
      1
    );

    return new MyResponse(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
