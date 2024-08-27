import test from "node:test";
import assert from "node:assert/strict";
import { GetCocktailsUseCase } from "./get-cocktails-user-case";
import * as schema from "../../drizzle/schema";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const queryClient = postgres(process.env["DATABASE_URL"]!);
const db = drizzle(queryClient, { schema, logger: true });

const useCase = new GetCocktailsUseCase(db);

test("should return cocktails with the specified name", async () => {
  const filters = { cocktailName: "Mojito" };

  const result = await useCase.execute(filters);

  assert.ok(result.every((item) => item.cocktails.name === "Mojito"));
});

test("should return cocktails that are alcoholic", async () => {
  const filters = { isAlcoholic: true };
  const result = await useCase.execute(filters);

  assert.ok(result.every((item) => item.cocktails.isAlcoholic === true));
});

test("should return cocktails with specified ingredients", async () => {
  const filters = { ingredientNames: ["VoDka", "Lime"] };
  const result = await useCase.execute(filters);
  console.log(result);
  assert.ok(result.some((item) => item.cocktails.name === "Christmas Cosmo"));
  assert.ok(result.length === 5);
});

test("should handle multiple filters correctly", async () => {
  const filters = {
    cocktailName: "Margarita",
    isAlcoholic: true,
    ingredientNames: ["TeQuila", "lImE"],
  };

  const result = await useCase.execute(filters);

  assert.ok(result.every((item) => item.cocktails.isAlcoholic === true));
  assert.ok(result.every((item) => item.cocktails.name === "Margarita"));
});

test("should return an empty array of cocktails if there is no name matched", async () => {
  const filters = { cocktailName: "BLAHBLAHBLAH" };

  const result = await useCase.execute(filters);

  assert.deepEqual(result, []);
});

test("should handle no filters correctly", async () => {
  const filters = {};
  const result = await useCase.execute(filters);

  assert.ok(result.length > 0);
});
