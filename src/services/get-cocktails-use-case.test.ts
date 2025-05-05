import test, { after } from "node:test";
import assert from "node:assert/strict";
import { GetCocktailsUseCase } from "./get-cocktails-use-case";
import * as schema from "../../drizzle/schema";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const queryClient = postgres(process.env["DATABASE_URL"]!);
const db = drizzle(queryClient, { schema, logger: true });

const useCase = new GetCocktailsUseCase(db);

after(async () => {
  await queryClient.end();
});

test("should return cocktails with the specified name", async () => {
  const filters = { name: "Mojito" };

  const result = await useCase.execute(filters);
  const cocktails = result.cocktails;

  assert.ok(
    cocktails.every((item) => item.name.toLowerCase().includes("mojito"))
  );
});

test("should return cocktails that are alcoholic", async () => {
  const filters = { isAlcoholic: true };
  const result = await useCase.execute(filters);
  const cocktails = result.cocktails;

  assert.ok(cocktails.every((item) => item.isAlcoholic));
});

test("should return cocktails with specified ingredients", async () => {
  const filters = { ingredients: ["VoDka", "Lime"] };
  const result = await useCase.execute(filters);
  const cocktails = result.cocktails;
  assert.ok(cocktails.some((item) => item.name === "Christmas Cosmo"));
  assert.ok(cocktails.length === 5);
});

test("should return cocktails with specified ingredients if ingredient is 2 or more words", async () => {
  const filters = { ingredients: ["Lime Juice"] };
  const result = await useCase.execute(filters);
  const cocktails = result.cocktails;
  assert.ok(cocktails.length > 0);
  assert.ok(cocktails.some((item) => item.name === "Margarita"));
});

test("should handle multiple filters correctly", async () => {
  const filters = {
    isAlcoholic: true,
    ingredients: ["TeQuila", "lImE"],
  };

  const result = await useCase.execute(filters);
  const cocktails = result.cocktails;

  assert.ok(cocktails.every((item) => item.isAlcoholic));
});

test("should return an empty array of cocktails if there is no name matched", async () => {
  const filters = { name: "BLAHBLAHBLAH" };

  const result = await useCase.execute(filters);
  const cocktails = result.cocktails;

  assert.deepEqual(cocktails, []);
  assert.ok(result.pagination.totalItems === 0);
});

test("should handle no filters correctly", async () => {
  const filters = {};
  const result = await useCase.execute(filters);
  const cocktails = result.cocktails;

  assert.ok(cocktails.length > 0);
});

test("should return 12 items only due to pagination", async () => {
  const result = await useCase.execute({}, 3);
  const cocktails = result.cocktails;

  assert.ok(cocktails.length === 12);
  assert.ok(result.pagination.currentPage === 3);
});
