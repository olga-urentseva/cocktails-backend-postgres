ALTER TABLE "collections_to_cocktails" DROP CONSTRAINT "collections_to_cocktails_collection_id_collections_id_fk";
--> statement-breakpoint
ALTER TABLE "collections_to_cocktails" DROP CONSTRAINT "collections_to_cocktails_cocktail_id_cocktails_id_fk";
--> statement-breakpoint
ALTER TABLE "ingredients_to_cocktails" DROP CONSTRAINT "ingredients_to_cocktails_cocktail_id_cocktails_id_fk";
--> statement-breakpoint
ALTER TABLE "ingredients_to_cocktails" DROP CONSTRAINT "ingredients_to_cocktails_ingredient_id_ingredients_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collections_to_cocktails" ADD CONSTRAINT "collections_to_cocktails_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collections_to_cocktails" ADD CONSTRAINT "collections_to_cocktails_cocktail_id_cocktails_id_fk" FOREIGN KEY ("cocktail_id") REFERENCES "public"."cocktails"("id") ON DELETE cascade ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ingredients_to_cocktails" ADD CONSTRAINT "ingredients_to_cocktails_cocktail_id_cocktails_id_fk" FOREIGN KEY ("cocktail_id") REFERENCES "public"."cocktails"("id") ON DELETE cascade ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ingredients_to_cocktails" ADD CONSTRAINT "ingredients_to_cocktails_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
