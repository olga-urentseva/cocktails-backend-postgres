import { and, count, eq, ilike, inArray, SQL, sql } from "drizzle-orm";
import type { Db } from "../db";
import * as schema from "../../drizzle/schema";
import { AnyPgColumn } from "drizzle-orm/pg-core";

function lower(item: AnyPgColumn): SQL {
  return sql`lower(${item})`;
}

type Filters = {
  name?: string | undefined;
  isAlcoholic?: boolean | undefined;
  ingredients?: string[] | undefined;
  collection?: string | undefined;
};

export interface IGetCocktailsUseCase {
  execute(
    filters: Filters,
    page: number | undefined
  ): Promise<{
    cocktails: Array<typeof schema.cocktails.$inferSelect>;
    pagination: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalItems: number;
    };
  }>;
}

export class GetCocktailsUseCase implements IGetCocktailsUseCase {
  database;
  private readonly PAGE_SIZE = 12;
  constructor(database: Db) {
    this.database = database;
  }

  async execute(filters: Filters, page: number = 1) {
    const conditions: SQL[] = [];
    const offset = (page - 1) * this.PAGE_SIZE;

    const cocktailsColumn = {
      id: schema.cocktails.id,
      name: schema.cocktails.name,
      instruction: schema.cocktails.instruction,
      pictureURL: schema.cocktails.pictureURL,
      isAlcoholic: schema.cocktails.isAlcoholic,
      glass: schema.cocktails.glass,
      credits: schema.cocktails.credits,
      totalItems: sql<number>`cast(count(*) OVER() as int)`,
    };

    const query = this.database.select(cocktailsColumn).from(schema.cocktails);

    if (filters.name) {
      conditions.push(
        sql`(${ilike(schema.cocktails.name, `${filters.name.toLocaleLowerCase()}%`)} OR
             ${ilike(schema.cocktails.name, `% ${filters.name.toLocaleLowerCase()}%`)})`
      );
    }
    if (filters.isAlcoholic !== undefined) {
      conditions.push(eq(schema.cocktails.isAlcoholic, filters.isAlcoholic));
    }

    const q2 = (() => {
      if (filters.collection) {
        return query.innerJoin(
          schema.collectionsToCocktails,
          and(
            eq(schema.cocktails.id, schema.collectionsToCocktails.cocktailId),
            eq(schema.collectionsToCocktails.collectionId, filters.collection)
          )
        );
      } else {
        return query;
      }
    })();

    const q3 = (() => {
      if (filters.ingredients) {
        const lowerCaseIngredientNames = filters.ingredients.map((name) =>
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
          .groupBy(
            schema.cocktails.id,
            schema.cocktails.name,
            schema.cocktails.instruction,
            schema.cocktails.pictureURL,
            schema.cocktails.isAlcoholic,
            schema.cocktails.glass,
            schema.cocktails.credits
          )
          .having(eq(count(schema.ingredients.id), filters.ingredients.length));
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

    const paginatedQuery = finalQuery.limit(this.PAGE_SIZE).offset(offset);

    const searchedByFiltersCocktails = await paginatedQuery;

    const [{ totalItems = 0 } = {}] = searchedByFiltersCocktails;

    const totalPages = Math.ceil(totalItems / this.PAGE_SIZE);

    return {
      cocktails: searchedByFiltersCocktails,
      pagination: {
        currentPage: page,
        pageSize: this.PAGE_SIZE,
        totalPages,
        totalItems,
      },
    };
  }
}
