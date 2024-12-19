import { drizzle } from "drizzle-orm/op-sqlite";
import { open } from "@op-engineering/op-sqlite";

const opsqlite = open({
  name: "myDB",
});

export const db = drizzle(opsqlite);
