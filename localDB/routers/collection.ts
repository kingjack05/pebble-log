import { useQuery } from "@tanstack/react-query";
import { db } from "../db";
import {
  bulletsToCollections,
  CollectionFilters,
  collections,
} from "../schema";
import { desc, eq } from "drizzle-orm";
import { isMatch } from "date-fns";

export const collectionKeys = {
  all: ["collections"] as const,
  dailyAll: () => [...collectionKeys.all, "daily"] as const,
  daily: (date: string) => [...collectionKeys.dailyAll(), date] as const,
  details: () => [...collectionKeys.all, "detail"] as const,
  detail: (id: number) => [...collectionKeys.details(), id] as const,
};
export const getCollections = async () => {
  const query = db
    .select()
    .from(collections)
    .orderBy(desc(collections.pinned), desc(collections.createdUTCTimestamp));
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

export async function getDailyLogAndCreateIfEmpty({ date }: { date: string }) {
  if (!isMatch(date, "yyyy-MM-dd")) {
    throw new Error("Invalid date format");
  }
  const transaction = db.transaction(async (tx) => {
    const dailyLog = await tx
      .select()
      .from(collections)
      .where(eq(collections.createdLocalDate, date));
    if (dailyLog.length > 0) {
      return dailyLog[0];
    } else {
      const mutation = await tx
        .insert(collections)
        .values({ type: "daily", title: date, createdLocalDate: date })
        .returning();
      return mutation[0];
    }
  });
  return await transaction;
}

export const updateCollectionPinned = async ({
  collectionId,
  pinned,
}: {
  collectionId: number;
  pinned: boolean;
}) => {
  const mutation = db
    .update(collections)
    .set({ pinned })
    .where(eq(collections.id, collectionId));
  await mutation;
};
export const updateCollectionFilters = async ({
  collectionId,
  filters,
}: {
  collectionId: number;
  filters: CollectionFilters;
}) => {
  const mutation = db
    .update(collections)
    .set({ filters })
    .where(eq(collections.id, collectionId));
  await mutation;
};

const bulletOrderSpacing = 100;
export const reorderBullet = async ({
  bulletId,
  collectionId,
  targetBulletId,
  position,
}: {
  bulletId: number;
  collectionId: number;
  targetBulletId: number;
  position: "before" | "after";
}) => {
  const mutation = db.transaction(async (tx) => {
    const bulletsInCollection = await tx
      .select()
      .from(bulletsToCollections)
      .where(eq(bulletsToCollections.collectionId, collectionId))
      .orderBy(bulletsToCollections.order);
    const toIndex =
      bulletsInCollection.findIndex((i) => i.bulletId === targetBulletId) +
      (position === "after" ? 1 : 0);

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
