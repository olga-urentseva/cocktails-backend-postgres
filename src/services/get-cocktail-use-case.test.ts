import test, { after, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { GetCocktailUseCase } from "./get-cocktail-use-case";
import * as schema from "../../drizzle/schema";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const queryClient = postgres(process.env["DATABASE_URL"]!, {
  max: 1, // Limit to single connection
  idle_timeout: 0, // Keep connection open
});
const db = drizzle(queryClient, { schema });

let useCase: GetCocktailUseCase;

beforeEach(() => {
  useCase = new GetCocktailUseCase(db);
});

after(async () => {
  await queryClient.end();
});

test("should return cocktail with the specified id", async () => {
  const id = "GGkCOT98WCbIv95j7wEIN";

  const result = await useCase.execute(id);
  assert.ok(result, "Result should not be null");
  assert.ok(result.cocktail, "Cocktail should exist");
  assert.equal(result.cocktail.id, id, "Cocktail ID should match");
  assert.ok(result.cocktail.name, "Cocktail should have a name");
  assert.ok(result.cocktail.instruction, "Cocktail should have instructions");
  assert.ok(
    Array.isArray(result.ingredients),
    "Ingredients should be an array",
  );
  assert.ok(
    result.ingredients.length > 0,
    "Cocktail should have at least one ingredient",
  );
  result.ingredients.forEach((ingredient) => {
    assert.ok(ingredient.id, "Each ingredient should have an ID");
    assert.ok(ingredient.name, "Each ingredient should have a name");
  });
});

test("should return null for non-existent cocktail", async () => {
  const nonExistentId = "non-existent-cocktail-id";

  const result = await useCase.execute(nonExistentId);

  assert.equal(result, null, "Result should be null for non-existent cocktail");
});
