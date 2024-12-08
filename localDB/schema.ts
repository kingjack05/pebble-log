import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
export const countTable = sqliteTable("countTable", {
  count: integer(),
});
