import { db } from "../db";
import {
  habits,
  habitCompletions,
  createHabitSchema,
  HabitCompletion,
} from "../schema";
import { and, eq, inArray, gte, lte } from "drizzle-orm";
import { range } from "@/lib/utils";
import { getDateStr } from "@/lib/dateTime";

export const trackersQueryKeys = {
  habits: ["habits"] as const,
  habitCompletions: (habitId: number, fromDate: string, toDate: string) =>
    ["habitCompletions", habitId, { fromDate, toDate }] as const,
  habitCompletionsByDate: (date: string) =>
    ["habitCompletions", { date }] as const,
  trackerScoreForDate: (date: string, type: "habit" | "external.fitbit") =>
    ["trackerScore", type, { date }] as const,
};

export async function getHabits() {
  const res = await db
    .select()
    .from(habits)
    .where(eq(habits.active, true))
    .orderBy(habits.order);
  return res;
}

export async function addHabit(values: createHabitSchema) {
  const mutation = await db.insert(habits).values(values);
  return mutation;
}

const orderSpacing = 100;
export const reorderHabit = async ({
  habitId,
  targetHabitId,
  position,
}: {
  habitId: number;
  targetHabitId: number;
  position: "before" | "after";
}) => {
  const mutation = db.transaction(async (tx) => {
    const habitsAll = await tx.select().from(habits).orderBy(habits.order);
    const toIndex =
      habitsAll.findIndex((i) => i.id === targetHabitId) +
      (position === "after" ? 1 : 0);

    const isInsertingToFirst = toIndex === 0;
    const isInsertingToLast = toIndex === habitsAll.length;
    const beforeItemOrder = isInsertingToFirst
      ? 0
      : habitsAll[toIndex - 1].order;
    const nextItemOrder = isInsertingToLast
      ? habitsAll[toIndex - 1].order
      : habitsAll[toIndex].order;

    const needsRebalancing = nextItemOrder - beforeItemOrder <= 1;
    if (needsRebalancing) {
      const habitsBefore = habitsAll
        .slice(0, toIndex)
        .filter((i) => i.id !== habitId);
      const habitsAfter = habitsAll
        .slice(toIndex)
        .filter((i) => i.id !== habitId);
      const reorderedHabits = [
        ...habitsBefore,
        habitsAll.find((i) => i.id === habitId)!,
        ...habitsAfter,
      ];
      const transaction = reorderedHabits.map((i, index) =>
        tx
          .update(habits)
          .set({
            order: (index + 1) * orderSpacing,
          })
          .where(eq(habits.id, i.id))
      );
      await Promise.allSettled(transaction);
    } else {
      const itemNewOrder = isInsertingToLast
        ? nextItemOrder + orderSpacing
        : beforeItemOrder + Math.floor((nextItemOrder - beforeItemOrder) / 2);
      await tx
        .update(habits)
        .set({ order: itemNewOrder })
        .where(eq(habits.id, habitId));
    }
  });
  await mutation;
};

export async function scheduleHabits() {
  const activeHabits = await db
    .select()
    .from(habits)
    .where(eq(habits.active, true));
  const today = new Date();
  const currentDay = today.getDay();
  const daysTillSatNextWeek = 13 - currentDay;
  const saturdayNextWeek = new Date();
  saturdayNextWeek.setDate(today.getDate() + daysTillSatNextWeek);
  const saturdayNextWeekStr = getDateStr(saturdayNextWeek);
  const habitsAlreadyScheduled = await db
    .select({ habitId: habitCompletions.habitId })
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.date, saturdayNextWeekStr),
        inArray(
          habitCompletions.habitId,
          activeHabits.map((i) => i.id)
        )
      )
    );
  const habitsAlreadyScheduledIDs = habitsAlreadyScheduled.map(
    (i) => i.habitId
  );
  const habitsToSchedule = activeHabits.filter(
    (i) => !habitsAlreadyScheduledIDs.includes(i.id)
  );
  function getDaysToSchedule(step: number) {
    const daysTillSatNextWeek = 13 - new Date().getDay();
    const daysToSchedule = range(0, daysTillSatNextWeek + 1, step).map((i) => {
      const day = new Date();
      day.setDate(day.getDate() + i);
      return getDateStr(day);
    });
    return daysToSchedule;
  }
  const habitCompletionsToInsert = habitsToSchedule.flatMap(
    ({ id: habitId, frequency }) => {
      const daysToSchedule = getDaysToSchedule(frequency);
      return daysToSchedule.map((date) => ({ habitId, date }));
    }
  );
  if (habitCompletionsToInsert.length > 0) {
    await db
      .insert(habitCompletions)
      .values(habitCompletionsToInsert)
      .onConflictDoNothing();
  }
}

export async function getHabitCompletions({
  habitId,
  fromDate,
  toDate,
}: {
  habitId: number;
  fromDate: string;
  toDate: string;
}) {
  const query = db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.habitId, habitId),
        gte(habitCompletions.date, fromDate),
        lte(habitCompletions.date, toDate)
      )
    );
  return await query;
}

export async function getHabitCompletionsForDay({ date }: { date: string }) {
  const query = db
    .select()
    .from(habits)
    .where(and(eq(habits.active, true), eq(habitCompletions.date, date)))
    .innerJoin(habitCompletions, eq(habits.id, habitCompletions.habitId));
  return await query;
}

export async function updateHabitCompletionStatus({
  date,
  habitId,
  status,
}: HabitCompletion) {
  const mutation = db
    .update(habitCompletions)
    .set({ status })
    .where(
      and(
        eq(habitCompletions.date, date),
        eq(habitCompletions.habitId, habitId)
      )
    );
  await mutation;
}

export async function getTrackerStore({ date }: { date: string }) {
  const habitCompletionsRes = await db
    .select()
    .from(habitCompletions)
    .where(eq(habitCompletions.date, date));
  if (habitCompletionsRes.length === 0) return 0;

  const habitScore =
    habitCompletionsRes.reduce((prev, curr) => {
      const statusScoreMap = {
        scheduled: 0,
        completed: 1,
        neutral: 0.5,
      } as const;
      const score = statusScoreMap[curr.status];
      return prev + score;
    }, 0) / habitCompletionsRes.length;

  return habitScore;
}
