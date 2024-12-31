import { relations } from "drizzle-orm";
import { pgTable, text, boolean, primaryKey, index } from "drizzle-orm/pg-core";

export const cocktails = pgTable("cocktails", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  instruction: text("instruction").notNull(),
  pictureURL: text("picture_url").notNull(),
  isAlcoholic: boolean("is_alcoholic").notNull(),
  glass: text("glass").notNull(),
  credits: text("credits"),
});

export const ingredients = pgTable(
  "ingredients",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
  },
  (table) => {
    return {
      nameIdx: index("name").on(table.name),
    };
  }
);

export const ingredientsToCocktails = pgTable(
  "ingredients_to_cocktails",
  {
    cocktailId: text("cocktail_id")
      .references(() => cocktails.id, {
        onDelete: "cascade",
        onUpdate: "restrict",
      })
      .notNull(),
    ingredientId: text("ingredient_id")
      .references(() => ingredients.id, {
        onDelete: "cascade",
        onUpdate: "restrict",
      })
      .notNull(),
    measure: text("measure"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.cocktailId, table.ingredientId] }),
  })
);

export const collections = pgTable("collections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pictureURL: text("picture_url").notNull(),
});

export const collectionsToCocktails = pgTable(
  "collections_to_cocktails",
  {
    collectionId: text("collection_id")
      .references(() => collections.id, {
        onDelete: "cascade",
        onUpdate: "restrict",
      })
      .notNull(),
    cocktailId: text("cocktail_id")
      .references(() => cocktails.id, {
        onDelete: "cascade",
        onUpdate: "restrict",
      })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.collectionId, table.cocktailId] }),
    collectionIdx: index("collection_idx").on(table.collectionId),
  })
);

export const ingredientRelatations = relations(ingredients, ({ many }) => ({
  ingredientsToCocktails: many(ingredientsToCocktails),
}));

export const cocktailsRelations = relations(cocktails, ({ many }) => ({
  ingredientsToCocktails: many(ingredientsToCocktails),
  collectionsToCocktails: many(collectionsToCocktails),
}));

export const ingredientsToCocktailsRelations = relations(
  ingredientsToCocktails,
  ({ one }) => ({
    cocktail: one(cocktails, {
      fields: [ingredientsToCocktails.cocktailId],
      references: [cocktails.id],
    }),
    ingredient: one(ingredients, {
      fields: [ingredientsToCocktails.ingredientId],
      references: [ingredients.id],
    }),
  })
);

export const collectionsToCocktailsRelations = relations(
  collectionsToCocktails,
  ({ one }) => ({
    cocktail: one(cocktails, {
      fields: [collectionsToCocktails.cocktailId],
      references: [cocktails.id],
    }),
    collection: one(collections, {
      fields: [collectionsToCocktails.collectionId],
      references: [collections.id],
    }),
  })
);

export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionsToCocktails: many(collectionsToCocktails),
}));
