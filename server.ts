import { db } from "./src/db";
import { Application } from "./src/application";

const app = new Application(db);
await app.run(
  process.env["HOST"],
  process.env["NODE_PORT"] ? Number(process.env["NODE_PORT"]) : undefined
);
