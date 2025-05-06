import type { Db } from "../db";
import * as schema from "../../drizzle/schema";
import { inArray } from "drizzle-orm";

import { seasonalCollectionsIds } from "../../data/seasonal-collections-ids";

export interface IGetCollectionsUseCase {
  execute(): Promise<Array<typeof schema.collections.$inferSelect>>;
}

export class GetCollectionsUseCase implements IGetCollectionsUseCase {
  constructor(private database: Db) {}

  async execute() {
    const rows = await this.database
      .select()
      .from(schema.collections)
      .where(inArray(schema.collections.id, seasonalCollectionsIds));

    return rows;
  }
}
