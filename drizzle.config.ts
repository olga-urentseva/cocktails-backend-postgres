import assert from "node:assert/strict";
import { defineConfig } from "drizzle-kit";

const DATABASE_URL = process.env["DATABASE_URL"];

assert(DATABASE_URL);

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
