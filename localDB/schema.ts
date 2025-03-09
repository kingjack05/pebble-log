import { relations, sql } from "drizzle-orm";
import {
  check,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { localDateQuery, utcDateTimeQuery } from "./commonQueries";

export const bulletTypes = [
  "task.open",
  "task.done",
  "event",
  "note",
  "gratitude",
  "win",
  "undefined",
  "null",
] as const;
export type BulletType = (typeof bulletTypes)[number];
export const bullets = sqliteTable("bullets", {
  id: integer().primaryKey({ autoIncrement: true }),
  type: text({
    enum: bulletTypes,
  }).notNull(),
  text: text().notNull(),
  time: text({ mode: "json" })
    .$type<{ start: number; end: number }[]>()
    .$defaultFn(() => {
      const utcEpoch = Math.floor(Date.now());
      return [{ start: utcEpoch, end: utcEpoch }];
    })
    .notNull(),
  reflection: text(),
  createdUTCTimestamp: text().notNull().default(utcDateTimeQuery),
});
const bulletsSelectSchema = createSelectSchema(bullets);
export type Bullet = Zod.infer<typeof bulletsSelectSchema>;
export const bulletsRelations = relations(bullets, ({ many }) => ({
  bulletsToCollections: many(bulletsToCollections),
}));

export const collectionTypes = [
  "daily",
  "weekly",
  "monthly",
  "custom",
] as const;
export type CollectionType = (typeof collectionTypes)[number];
export type CollectionFilters = {
  type: "bulletType.hide";
  value: BulletType;
}[];
export const collections = sqliteTable("collections", {
  id: integer().primaryKey({ autoIncrement: true }),
  type: text({
    enum: ["daily", "weekly", "monthly", "custom"],
  }).notNull(),
  title: text().notNull(),
  pinned: integer({ mode: "boolean" }).notNull().default(false),
  filters: text({ mode: "json" })
    .$type<CollectionFilters>()
    .notNull()
    .default([]),
  createdLocalDate: text().notNull().default(localDateQuery),
  createdUTCTimestamp: text().notNull().default(utcDateTimeQuery),
});
const collectionsSchema = createSelectSchema(collections);
export type Collection = Zod.infer<typeof collectionsSchema>;
export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionsToBullets: many(bulletsToCollections),
}));

export const bulletsToCollections = sqliteTable(
  "bulletsToCollections",
  {
    bulletId: integer()
      .references(() => bullets.id)
      .notNull(),
    collectionId: integer()
      .references(() => collections.id)
      .notNull(),
    order: integer().notNull(),
  },
  (table) => [
    primaryKey({ name: "id", columns: [table.bulletId, table.collectionId] }),
    check("orderIsPositive", sql`${table.order} > 0`),
  ]
);
export const bulletsToCollectionsRelations = relations(
  bulletsToCollections,
  ({ one }) => ({
    bullet: one(bullets, {
      fields: [bulletsToCollections.bulletId],
      references: [bullets.id],
    }),
    collections: one(collections, {
      fields: [bulletsToCollections.collectionId],
      references: [collections.id],
    }),
  })
);

export const habits = sqliteTable("habits", {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  active: integer({ mode: "boolean" }).notNull().default(true),
  frequency: integer().notNull().default(1),
  order: integer().notNull().default(0),
});
const createHabitSchema = createInsertSchema(habits);
export type createHabitSchema = Zod.infer<typeof createHabitSchema>;
export const habitsRelations = relations(habits, ({ many }) => ({
  completions: many(habitCompletions),
}));

const habitStatusEnum = ["scheduled", "completed", "neutral"] as const;
export const habitCompletions = sqliteTable(
  "habitCompletions",
  {
    habitId: integer()
      .notNull()
      .references(() => habits.id),
    date: text().notNull(),
    status: text({ enum: habitStatusEnum }).notNull().default("scheduled"),
  },
  (t) => [primaryKey({ columns: [t.date, t.habitId] })]
);
const habitCompletionsSchema = createSelectSchema(habitCompletions);
export type HabitCompletion = Zod.infer<typeof habitCompletionsSchema>;
const habitCompletionsRelations = relations(habitCompletions, ({ one }) => ({
  habit: one(habits, {
    fields: [habitCompletions.habitId],
    references: [habits.id],
  }),
}));
