SELECT    "cocktails"."id",
          "cocktails"."name",
          "cocktails"."instruction",
          "cocktails"."picture_url",
          "cocktails"."is_alcoholic",
          "cocktails"."glass",
          "cocktails"."credits",
          "cocktails_collectionsToCocktails"."data" AS "collectionsToCocktails",
          "cocktails_ingredientsToCocktails"."data" AS "ingredientsToCocktails"
FROM      "cocktails"
left join lateral
          (
                    SELECT    coalesce(json_agg(json_build_array("cocktails_collectionsToCocktails"."collection_id", "cocktails_collectionsToCocktails"."cocktail_id", "cocktails_collectionsToCocktails_cocktail"."data", "cocktails_collectionsToCocktails_collection"."data")), '[]'::json) AS "data"
                    FROM      "collections_to_cocktails" "cocktails_collectionsToCocktails"
                    left join lateral
                              (
                                     SELECT json_build_array("cocktails_collectionsToCocktails_cocktail"."id", "cocktails_collectionsToCocktails_cocktail"."name", "cocktails_collectionsToCocktails_cocktail"."instruction", "cocktails_collectionsToCocktails_cocktail"."picture_url", "cocktails_collectionsToCocktails_cocktail"."is_alcoholic", "cocktails_collectionsToCocktails_cocktail"."glass", "cocktails_collectionsToCocktails_cocktail"."credits") AS "data"
                                     FROM   (
                                                   SELECT *
                                                   FROM   "cocktails" "cocktails_collectionsToCocktails_cocktail"
                                                   WHERE  "cocktails_collectionsToCocktails_cocktail"."id" = "cocktails_collectionsToCocktails"."cocktail_id" limit $1) "cocktails_collectionsToCocktails_cocktail") "cocktails_collectionsToCocktails_cocktail"
                    ON        TRUE
                    left join lateral
                              (
                                     SELECT json_build_array("cocktails_collectionsToCocktails_collection"."id", "cocktails_collectionsToCocktails_collection"."name", "cocktails_collectionsToCocktails_collection"."description", "cocktails_collectionsToCocktails_collection"."picture_url") AS "data"
                                     FROM   (
                                                   SELECT *
                                                   FROM   "collections" "cocktails_collectionsToCocktails_collection"
                                                   WHERE  "cocktails_collectionsToCocktails_collection"."id" = "cocktails_collectionsToCocktails"."collection_id" limit $2) "cocktails_collectionsToCocktails_collection") "cocktails_collectionsToCocktails_collection"
                    ON        TRUE
                    WHERE     "cocktails_collectionsToCocktails"."cocktail_id" = "cocktails"."id") "cocktails_collectionsToCocktails"
ON        TRUE
left join lateral
          (
                    SELECT    coalesce(json_agg(json_build_array("cocktails_ingredientsToCocktails"."cocktail_id", "cocktails_ingredientsToCocktails"."ingredient_id", "cocktails_ingredientsToCocktails"."measure", "cocktails_ingredientsToCocktails_cocktail"."data", "cocktails_ingredientsToCocktails_ingredient"."data")), '[]'::json) AS "data"
                    FROM      "ingredients_to_cocktails" "cocktails_ingredientsToCocktails"
                    left join lateral
                              (
                                     SELECT json_build_array("cocktails_ingredientsToCocktails_cocktail"."id", "cocktails_ingredientsToCocktails_cocktail"."name", "cocktails_ingredientsToCocktails_cocktail"."instruction", "cocktails_ingredientsToCocktails_cocktail"."picture_url", "cocktails_ingredientsToCocktails_cocktail"."is_alcoholic", "cocktails_ingredientsToCocktails_cocktail"."glass", "cocktails_ingredientsToCocktails_cocktail"."credits") AS "data"
                                     FROM   (
                                                   SELECT *
                                                   FROM   "cocktails" "cocktails_ingredientsToCocktails_cocktail"
                                                   WHERE  "cocktails_ingredientsToCocktails_cocktail"."id" = "cocktails_ingredientsToCocktails"."cocktail_id" limit $3) "cocktails_ingredientsToCocktails_cocktail") "cocktails_ingredientsToCocktails_cocktail"
                    ON        TRUE
                    left join lateral
                              (
                                     SELECT json_build_array("cocktails_ingredientsToCocktails_ingredient"."id", "cocktails_ingredientsToCocktails_ingredient"."name") AS "data"
                                     FROM   (
                                                   SELECT *
                                                   FROM   "ingredients" "cocktails_ingredientsToCocktails_ingredient"
                                                   WHERE  "cocktails_ingredientsToCocktails_ingredient"."id" = "cocktails_ingredientsToCocktails"."ingredient_id" limit $4) "cocktails_ingredientsToCocktails_ingredient") "cocktails_ingredientsToCocktails_ingredient"
                    ON        TRUE
                    WHERE     "cocktails_ingredientsToCocktails"."cocktail_id" = "cocktails"."id") "cocktails_ingredientsToCocktails"
ON        TRUE
WHERE     "cocktails"."name" = $5