import type { Db } from "../db";
import * as schema from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface IGetCocktailUseCase {
  execute(id: string): Promise<null | {
    cocktail: typeof schema.cocktails.$inferSelect;
    ingredients: (typeof schema.ingredients.$inferSelect &
      Omit<
        typeof schema.ingredientsToCocktails.$inferSelect,
        "cocktailId" | "ingredientId"
      >)[];
  }>;
}

export class GetCocktailUseCase implements IGetCocktailUseCase {
  constructor(private database: Db) {}

  async execute(id: string) {
    const rows = await this.database
      .select({
        cocktail: {
          id: schema.cocktails.id,
          name: schema.cocktails.name,
          instruction: schema.cocktails.instruction,
          pictureURL: schema.cocktails.pictureURL,
          isAlcoholic: schema.cocktails.isAlcoholic,
          glass: schema.cocktails.glass,
          credits: schema.cocktails.credits,
        },
        ingredients: {
          name: schema.ingredients.name,
          id: schema.ingredients.id,
          measure: schema.ingredientsToCocktails.measure,
        },
      })
      .from(schema.cocktails)
      .innerJoin(
        schema.ingredientsToCocktails,
        eq(schema.cocktails.id, schema.ingredientsToCocktails.cocktailId),
      )
      .innerJoin(
        schema.ingredients,
        eq(schema.ingredients.id, schema.ingredientsToCocktails.ingredientId),
      )

      .where(eq(schema.cocktails.id, id));

    if (rows.length === 0) {
      return null;
    }

    return {
      cocktail: rows[0]!.cocktail,
      ingredients: rows.map((row) => row.ingredients),
    };
  }
}
