import { useMutation, useQuery } from "@tanstack/react-query";
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
};

export async function getHabits() {
  const res = await db.select().from(habits).where(eq(habits.active, true));
  return res;
}

export async function addHabit(values: createHabitSchema) {
  const mutation = await db.insert(habits).values(values);
  return mutation;
}

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
