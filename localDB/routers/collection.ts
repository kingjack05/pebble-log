import { useMutation, useQuery } from "@tanstack/react-query";
import { db } from "../db";
import { bulletsToCollections, collections } from "../schema";
import { desc, eq } from "drizzle-orm";
import { localDateQuery } from "../commonQueries";

const collectionKeys = {
  all: ["collections"] as const,
  details: () => [...collectionKeys.all, "detail"] as const,
  detail: (id: number) => [...collectionKeys.details(), id] as const,
};
export const getCollections = async () => {
  const query = db
    .select()
    .from(collections)
    .orderBy(desc(collections.createdUTCTimestamp));
  return await query;
};

export const getCollection = async ({
  collectionId,
}: {
  collectionId: number;
}) => {
  const query = db
    .select()
    .from(collections)
    .where(eq(collections.id, collectionId));
  return (await query)[0];
};
export const useCollectionQuery = (collectionId: number) =>
  useQuery({
    queryKey: collectionKeys.detail(collectionId),
    queryFn: async () => await getCollection({ collectionId }),
  });
export const createCustomCollection = async ({ title }: { title: string }) => {
  const mutation = db.insert(collections).values({ type: "custom", title });
  await mutation;
};
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

const bulletOrderSpacing = 100;
export const reorderBullet = async ({
  bulletId,
  collectionId,
  toIndex,
}: {
  bulletId: number;
  collectionId: number;
  toIndex: number;
}) => {
  const mutation = db.transaction(async (tx) => {
    const bulletsInCollection = await tx
      .select()
      .from(bulletsToCollections)
      .where(eq(bulletsToCollections.collectionId, collectionId))
      .orderBy(bulletsToCollections.order);

    const isInsertingToFirst = toIndex === 0;
    const isInsertingToLast = toIndex === bulletsInCollection.length;
    const beforeItemOrder = isInsertingToFirst
      ? 0
      : bulletsInCollection[toIndex - 1].order;
    const nextItemOrder = isInsertingToLast
      ? bulletsInCollection[toIndex - 1].order
      : bulletsInCollection[toIndex].order;

    const needsRebalancing = nextItemOrder - beforeItemOrder === 1;
    if (needsRebalancing) {
      const bulletsBefore = bulletsInCollection
        .slice(0, toIndex)
        .filter((i) => i.bulletId !== bulletId);
      const bulletsAfter = bulletsInCollection
        .slice(toIndex)
        .filter((i) => i.bulletId !== bulletId);
      const reorderedBullets = [
        ...bulletsBefore,
        bulletsInCollection.find((i) => i.bulletId === bulletId)!,
        ...bulletsAfter,
      ];
      const transaction = reorderedBullets.map((i, index) =>
        tx
          .update(bulletsToCollections)
          .set({
            order: (index + 1) * bulletOrderSpacing,
          })
          .where(eq(bulletsToCollections.bulletId, i.bulletId))
      );
      await Promise.allSettled(transaction);
    } else {
      const itemNewOrder = isInsertingToLast
        ? nextItemOrder + bulletOrderSpacing
        : beforeItemOrder + Math.floor((nextItemOrder - beforeItemOrder) / 2);
      await tx
        .update(bulletsToCollections)
        .set({ order: itemNewOrder })
        .where(eq(bulletsToCollections.bulletId, bulletId));
    }
  });
  await mutation;
};
