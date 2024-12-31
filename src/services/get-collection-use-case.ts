import type { Db } from "../db";
import * as schema from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface IGetCollectionUseCase {
  execute(id: string): Promise<null | {
    id: string;
    name: string;
    description: string;
    pictureURL: string;
  }>;
}

export class GetCollectionUseCase implements IGetCollectionUseCase {
  database;
  constructor(database: Db) {
    this.database = database;
  }

  async execute(id: string) {
    const [result] = await this.database
      .select({
        id: schema.collections.id,
        name: schema.collections.name,
        description: schema.collections.description,
        pictureURL: schema.collections.pictureURL,
      })
      .from(schema.collections)
      .where(eq(schema.collections.id, id));

    if (!result) {
      return null;
    }

    return result;
  }
}
