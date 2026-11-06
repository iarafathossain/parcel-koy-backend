import { defineConfig } from "prisma/config";
import { envVariables } from "./src/config/env.js";

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: envVariables.DATABASE_URL,
  },
});
