import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../drizzle/schema";

const queryClient = postgres(process.env["DATABASE_URL"]!);
export const db = drizzle(queryClient, { schema, logger: true });

export type Db = typeof db;
