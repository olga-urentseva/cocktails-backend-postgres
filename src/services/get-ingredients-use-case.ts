import type { Db } from "../db";
import * as schema from "../../drizzle/schema";
import { ilike } from "drizzle-orm";

export class GetIngredientsUseCase {
  database;
  constructor(database: Db) {
    this.database = database;
  }

  async execute(prefix: string) {
    const result = await this.database
      .select()
      .from(schema.ingredients)
      .where(ilike(schema.ingredients.name, `${prefix}%`));

    return result;
  }
}
