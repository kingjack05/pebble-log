import { useMutation, useQuery } from "@tanstack/react-query";
import { db } from "../db";
import { habits, habitCompletions, createHabitSchema } from "../schema";
import { and, eq, inArray, gte, lte } from "drizzle-orm";
import { range } from "@/lib/utils";

export const trackersQueryKeys = {
  habits: ["habits"] as const,
  habitCompletions: (habitId: number, fromDate: string, toDate: string) =>
    ["habitCompletions", habitId, { fromDate, toDate }] as const,
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
  const saturdayNextWeekStr = saturdayNextWeek.toISOString().split("T")[0];
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
      return day.toISOString().split("T")[0];
    });
    return daysToSchedule;
  }
  const habitCompletionsToInsert = habitsToSchedule.flatMap(
    ({ id: habitId, frequency }) => {
      const daysToSchedule = getDaysToSchedule(frequency);
      return daysToSchedule.map((date) => ({ habitId, date }));
    }
  );
  await db
    .insert(habitCompletions)
    .values(habitCompletionsToInsert)
    .onConflictDoNothing();
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
