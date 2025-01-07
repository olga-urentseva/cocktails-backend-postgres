import type { Db } from "../db";
import * as schema from "../../drizzle/schema";

export interface IGetCollectionsUseCase {
  execute(): Promise<Array<typeof schema.collections.$inferSelect>>;
}

export class GetCollectionsUseCase implements IGetCollectionsUseCase {
  constructor(private database: Db) {}

  async execute() {
    const rows = await this.database.select().from(schema.collections);

    return rows;
  }
}
