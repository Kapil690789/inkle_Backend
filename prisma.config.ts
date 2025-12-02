
import "dotenv/config";
import { defineConfig, env } from "./src/prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
// npm install --save-dev prisma dotenv