import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../drizzle/schema";
import { readFileSync } from "node:fs";
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
export const db = drizzle(queryClient, { schema, logger: true });

export type Db = typeof db;
