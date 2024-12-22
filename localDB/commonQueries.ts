import { sql } from "drizzle-orm";

export const localDateQuery = sql`(date('now', 'localtime'))`;
export const utcDateTimeQuery = sql`(datetime('now'))`;
