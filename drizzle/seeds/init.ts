import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { readFileSync } from "node:fs";

import cocktailsRawData from "../../data/cocktails.json" with { type: "json" };
import ingredientsRawData from "../../data/ingredients.json" with { type: "json" };
import collectionsRawData from "../../data/collections.json" with { type: "json" };

import {
  cocktails,
  ingredients,
  ingredientsToCocktails,
  collections,
  collectionsToCocktails,
} from "../schema.ts";
import { assert } from "node:console";

function ensure<T>(value: T): NonNullable<T> {
  if (typeof value === "undefined" || value === null) {
    throw new Error("missing value");
  }

  return value;
}

const DATABASE_URL =
  process.env["DATABASE_URL"] ??
  readFileSync(ensure(process.env["DATABASE_URL_SECRET_PATH"]), "utf-8").trim();

assert(DATABASE_URL);

const queryClient = postgres(DATABASE_URL);

const db = drizzle(queryClient);

const ingredientsData = ingredientsRawData.map((ing) => {
  return { id: ing.id, name: ing.name };
});

const cocktailsData = cocktailsRawData.map<typeof cocktails.$inferInsert>(
  (cocktail) => {
    return {
      id: cocktail.id,
      name: cocktail.cocktailName,
      glass: cocktail.glass,
      instruction: cocktail.instruction,
      isAlcoholic: cocktail.isAlcoholic,
      pictureURL: cocktail.pictureURL,
      credits: cocktail.credits ?? null,
    };
  }
);

const ingsToCocktailsData = cocktailsRawData.flatMap((cocktail) =>
  cocktail.ingredients.map<typeof ingredientsToCocktails.$inferInsert>(
    (ingredient) => ({
      ingredientId: ingredient.id,
      cocktailId: cocktail.id,
      measure: ingredient.measure,
    })
  )
);

const collectionsData = collectionsRawData.map<typeof collections.$inferInsert>(
  (collection) => {
    return {
      id: collection.id,
      name: collection.collectionName,
      description: collection.description,
      pictureURL: collection.imageUrl,
    };
  }
);

const collectionsToCocktailsData = collectionsRawData.flatMap((collection) =>
  collection.cocktails.map<typeof collectionsToCocktails.$inferInsert>(
    (cocktailIds) => ({
      cocktailId: cocktailIds,
      collectionId: collection.id,
    })
  )
);

db.transaction(async (tx) => {
  await tx
    .insert(ingredients)
    .values(ingredientsData)
    .onConflictDoUpdate({
      target: ingredients.id,
      set: { name: sql`excluded.name` },
    });

  await tx
    .insert(cocktails)
    .values(cocktailsData)
    .onConflictDoUpdate({
      target: cocktails.id,
      set: {
        name: sql`excluded.name`,
        instruction: sql`excluded.instruction`,
        pictureURL: sql`excluded.picture_url`,
        isAlcoholic: sql`excluded.is_alcoholic`,
        glass: sql`excluded.glass`,
        credits: sql`excluded.credits`,
      },
    });

  await tx
    .insert(ingredientsToCocktails)
    .values(ingsToCocktailsData)
    .onConflictDoUpdate({
      target: [
        ingredientsToCocktails.cocktailId,
        ingredientsToCocktails.ingredientId,
      ],
      set: {
        measure: sql`excluded.measure`,
      },
    });

  await tx
    .insert(collections)
    .values(collectionsData)
    .onConflictDoUpdate({
      target: collections.id,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        pictureURL: sql`excluded.picture_url`,
      },
    });

  await tx
    .insert(collectionsToCocktails)
    .values(collectionsToCocktailsData)
    .onConflictDoNothing();
});

await queryClient.end();
