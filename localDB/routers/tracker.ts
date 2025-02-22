import { useMutation, useQuery } from "@tanstack/react-query";
import { db } from "../db";
import { habits, habitCompletions, createHabitSchema } from "../schema";
import { eq } from "drizzle-orm";

export const trackersQueryKeys = {
  habits: ["habits"] as const,
};

export async function getHabits() {
  const res = await db.select().from(habits).where(eq(habits.active, true));
  return res;
}

export async function addHabit(values: createHabitSchema) {
  const mutation = await db.insert(habits).values(values);
  return mutation;
}
