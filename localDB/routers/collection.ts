import { useMutation, useQuery } from "@tanstack/react-query";
import { db } from "../db";
import { collections } from "../schema";
import { eq } from "drizzle-orm";
import { localDateQuery } from "../commonQueries";

export const createDailyLog = () =>
  useMutation({
    mutationFn: async () => {
      const mutation = db
        .insert(collections)
        .values({ type: "daily", title: localDateQuery });
      await mutation;
    },
  });

export const getDailyLogForToday = () =>
  useQuery({
    queryKey: ["collection.getDailyLogForToday"],
    queryFn: async () => {
      const query = db
        .select()
        .from(collections)
        .where(eq(collections.createdLocalDate, localDateQuery));
      const res = await query;
      return res.length > 0 ? res[0] : null;
    },
  });

export const updateCollectionTitle = () =>
  useMutation({
    mutationFn: async ({
      collectionId,
      title,
    }: {
      collectionId: number;
      title: string;
    }) => {
      const mutation = db
        .update(collections)
        .set({ title })
        .where(eq(collections.id, collectionId));
      await mutation;
    },
  });
