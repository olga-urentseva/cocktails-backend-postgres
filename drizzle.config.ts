import assert from "node:assert/strict";
import { defineConfig } from "drizzle-kit";
import { readFileSync } from "node:fs";

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

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
