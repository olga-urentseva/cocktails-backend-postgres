import { and, count, eq, ilike, inArray, SQL, sql } from "drizzle-orm";
import { db } from "../db";
import * as schema from "../../drizzle/schema";
import { AnyPgColumn } from "drizzle-orm/pg-core";

function lower(item: AnyPgColumn): SQL {
  return sql`lower(${item})`;
}

type Filters = {
  cocktailName?: string;
  isAlcoholic?: boolean;
  ingredientNames?: string[];
  collectionId?: string;
  page?: number;
};

export class GetCocktailsUseCase {
  database;
  constructor(database = db) {
    this.database = database;
  }

  async execute(filters: Filters) {
    const conditions = [];

    const query = this.database
      .select({
        cocktails: schema.cocktails,
      })
      .from(schema.cocktails);

    if (filters.cocktailName) {
      conditions.push(
        ilike(schema.cocktails.name, filters.cocktailName.toLocaleLowerCase())
      );
    }
    if (filters.isAlcoholic !== undefined) {
      conditions.push(eq(schema.cocktails.isAlcoholic, filters.isAlcoholic));
    }

    const q2 = (() => {
      if (filters.collectionId) {
        return query.innerJoin(
          schema.collectionsToCocktails,
          and(
            eq(schema.cocktails.id, schema.collectionsToCocktails.cocktailId),
            eq(schema.collectionsToCocktails.collectionId, filters.collectionId)
          )
        );
      } else {
        return query;
      }
    })();

    const q3 = (() => {
      if (filters.ingredientNames) {
        const lowerCaseIngredientNames = filters.ingredientNames.map((name) =>
          name.toLowerCase()
        );
        conditions.push(
          inArray(lower(schema.ingredients.name), lowerCaseIngredientNames)
        );
        return query
          .innerJoin(
            schema.ingredientsToCocktails,
            eq(schema.cocktails.id, schema.ingredientsToCocktails.cocktailId)
          )
          .innerJoin(
            schema.ingredients,
            eq(
              schema.ingredients.id,
              schema.ingredientsToCocktails.ingredientId
            )
          )
          .groupBy(schema.cocktails.id)
          .having(
            eq(count(schema.ingredients.id), filters.ingredientNames.length)
          );
      } else {
        return q2;
      }
    })();

    const finalQuery = (() => {
      if (conditions.length) {
        return query.where(and(...conditions));
      } else {
        return q3;
      }
    })();

    return await finalQuery;
  }
}
