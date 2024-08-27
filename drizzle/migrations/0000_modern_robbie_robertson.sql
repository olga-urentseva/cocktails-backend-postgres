CREATE TABLE IF NOT EXISTS "cocktails" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"instruction" text NOT NULL,
	"picture_url" text NOT NULL,
	"is_alcoholic" boolean NOT NULL,
	"glass" text NOT NULL,
	"credits" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collections" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"picture_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collections_to_cocktails" (
	"collection_id" text NOT NULL,
	"cocktail_id" text NOT NULL,
	CONSTRAINT "collections_to_cocktails_collection_id_cocktail_id_pk" PRIMARY KEY("collection_id","cocktail_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingredients_to_cocktails" (
	"cocktail_id" text NOT NULL,
	"ingredient_id" text NOT NULL,
	"measure" text,
	CONSTRAINT "ingredients_to_cocktails_cocktail_id_ingredient_id_pk" PRIMARY KEY("cocktail_id","ingredient_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collections_to_cocktails" ADD CONSTRAINT "collections_to_cocktails_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collections_to_cocktails" ADD CONSTRAINT "collections_to_cocktails_cocktail_id_cocktails_id_fk" FOREIGN KEY ("cocktail_id") REFERENCES "public"."cocktails"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ingredients_to_cocktails" ADD CONSTRAINT "ingredients_to_cocktails_cocktail_id_cocktails_id_fk" FOREIGN KEY ("cocktail_id") REFERENCES "public"."cocktails"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ingredients_to_cocktails" ADD CONSTRAINT "ingredients_to_cocktails_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
