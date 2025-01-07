import type { Db } from "../db";
import * as schema from "../../drizzle/schema";
import { ilike } from "drizzle-orm";

export interface IGetIngredientsUseCase {
  execute(prefix: string | undefined): Promise<{ id: string; name: string }[]>;
}

export class GetIngredientsUseCase implements IGetIngredientsUseCase {
  database;
  constructor(database: Db) {
    this.database = database;
  }

  async execute(prefix?: string) {
    if (!prefix) {
      return [];
    }
    return this.database
      .select()
      .from(schema.ingredients)
      .where(ilike(schema.ingredients.name, `${prefix}%`));
  }
}
