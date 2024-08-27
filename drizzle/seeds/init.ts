import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";

import cocktailsRawData from "../../data/cocktails.json";
import ingredientsRawData from "../../data/ingredients.json";
import collectionsRawData from "../../data/collections.json";

import {
  cocktails,
  ingredients,
  ingredientsToCocktails,
  collections,
  collectionsToCocktails,
} from "../schema";

if (!("DATABASE_URL" in process.env)) throw new Error("DATABASE_URL not found");

const queryClient = postgres(process.env["DATABASE_URL"]!);

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
