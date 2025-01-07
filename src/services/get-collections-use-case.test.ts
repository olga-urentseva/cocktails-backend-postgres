import test, { after, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { GetCollectionsUseCase } from "./get-collections-use-case";

import * as schema from "../../drizzle/schema";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const queryClient = postgres(process.env["DATABASE_URL"]!, {
  max: 1, // Limit to single connection
  idle_timeout: 0, // Keep connection open
});
const db = drizzle(queryClient, { schema });

let useCase: GetCollectionsUseCase;

beforeEach(() => {
  useCase = new GetCollectionsUseCase(db);
});

after(async () => {
  await queryClient.end();
});

test("should return a list of collections", async () => {
  const result = await useCase.execute();

  assert.ok(result, "Result should not be null");
  assert.ok(Array.isArray(result), "Result should be an array");
  assert.ok(result.length > 0, "Result should have at least one collection");
  result.forEach((collection) => {
    assert.ok(collection.id, "Each collection should have an ID");
    assert.ok(collection.name, "Each collection should have a name");
  });
});
