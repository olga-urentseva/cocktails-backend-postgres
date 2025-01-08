import type { Db } from "../db";
import * as schema from "../../drizzle/schema";
import { inArray } from "drizzle-orm";

const SEASONAL_COLLECTIONS_IDS = [
  "spring",
  "classic",
  "healthy",
  "hozier",
  "lana",
];

export interface IGetCollectionsUseCase {
  execute(): Promise<Array<typeof schema.collections.$inferSelect>>;
}

export class GetCollectionsUseCase implements IGetCollectionsUseCase {
  constructor(private database: Db) {}

  async execute() {
    const rows = await this.database
      .select()
      .from(schema.collections)
      .where(inArray(schema.collections.id, SEASONAL_COLLECTIONS_IDS));

    return rows;
  }
}
