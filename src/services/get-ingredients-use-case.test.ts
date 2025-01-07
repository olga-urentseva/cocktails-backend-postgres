import test, { after, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { GetIngredientsUseCase } from "./get-ingredients-use-case";

import * as schema from "../../drizzle/schema";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const queryClient = postgres(process.env["DATABASE_URL"]!, {
  max: 1, // Limit to single connection
  idle_timeout: 0, // Keep connection open
});
const db = drizzle(queryClient, { schema });

let useCase: GetIngredientsUseCase;

beforeEach(() => {
  useCase = new GetIngredientsUseCase(db);
});

after(async () => {
  await queryClient.end();
});

test("should return ingredients by prefix", async () => {
  const prefix = "Lim";

  const result = await useCase.execute(prefix);
  assert.ok(result, "Result should not be null");
  assert.ok(Array.isArray(result), "Ingredients should be an array");
  result.forEach((ingredient) => {
    assert.ok(ingredient.id, "Each ingredient should have an ID");
    assert.ok(ingredient.name, "Each ingredient should have a name");
    assert.ok(
      ingredient.name.toLowerCase().startsWith(prefix.toLowerCase()),
      `Ingredient name "${ingredient.name}" should start with "${prefix}"`,
    );
  });
});

test("should return an empty array if there is no ingredients with specifix prefix", async () => {
  const prefix = "BLAHBLAHBLAH";
  const result = await useCase.execute(prefix);

  assert.ok(Array.isArray(result), "Result should be an array");
  assert.equal(result.length, 0, "Array should be empty for invalid prefix");
});
