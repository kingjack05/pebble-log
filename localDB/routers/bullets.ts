import { useMutation, useQuery } from "@tanstack/react-query";
import { db } from "../db";
import { Bullet, bullets, bulletsToCollections } from "../schema";
import { eq } from "drizzle-orm";

export const bulletKeys = {
  all: ["bullets"] as const,
  collections: () => [...bulletKeys.all, "collection"] as const,
  collection: (collectionId: number) =>
    [...bulletKeys.collections(), { collectionId }] as const,
  details: () => [...bulletKeys.all, "detail"] as const,
  detail: (id: number) => [...bulletKeys.details(), id] as const,
};

export const getCollectionBullets = async ({
  collectionId,
}: {
  collectionId: number;
}) => {
  const res = await db
    .select()
    .from(bulletsToCollections)
    .innerJoin(bullets, eq(bulletsToCollections.bulletId, bullets.id))
    .where(eq(bulletsToCollections.collectionId, collectionId))
    .orderBy(bulletsToCollections.order)
    .all();
  return res;
};
export type CollectionBullets = Awaited<
  ReturnType<typeof getCollectionBullets>
>;
export const useCollectionBullets = (collectionId: number) =>
  useQuery({
    queryKey: bulletKeys.collection(collectionId),
    queryFn: async () => {
      return await getCollectionBullets({ collectionId });
    },
  });

const getBulletDetail = async ({ bulletId }: { bulletId: number }) => {
  const res = await db.select().from(bullets).where(eq(bullets.id, bulletId));
  return res[0];
};
export const useBulletDetail = ({ bulletId }: { bulletId: number }) =>
  useQuery({
    queryKey: bulletKeys.detail(bulletId),
    queryFn: async () => {
      return await getBulletDetail({ bulletId });
    },
  });

export const addBulletToCollection = async ({
  text,
  type,
  order,
  collectionId,
}: {
  text: string;
  type: Bullet["type"];
  order: number;
  collectionId: number;
}) => {
  const createBullet = db.insert(bullets).values({ text, type });
  const createdBullet = (await createBullet.returning())[0];
  const bulletId = createdBullet.id;
  const addBulletToCollection = db
    .insert(bulletsToCollections)
    .values({ bulletId, collectionId, order });
  const createdBulletsToCollections = (
    await addBulletToCollection.returning()
  )[0];
  return {
    bullets: createdBullet,
    bulletsToCollections: createdBulletsToCollections,
  };
};

export const useAddBulletToCollection = () => {
  return useMutation({
    mutationFn: addBulletToCollection,
  });
};
export const updateBulletType = () =>
  useMutation({
    mutationFn: async ({
      bulletId,
      type,
    }: {
      bulletId: number;
      type: Bullet["type"];
    }) => {
      const mutation = db
        .update(bullets)
        .set({ type })
        .where(eq(bullets.id, bulletId));
      await mutation;
    },
  });
export const updateBulletText = async ({
  bulletId,
  text,
}: {
  bulletId: number;
  text: string;
}) => {
  const mutation = db
    .update(bullets)
    .set({ text })
    .where(eq(bullets.id, bulletId));
  await mutation;
};
export const updateBulletReflection = async ({
  bulletId,
  reflection,
}: {
  bulletId: number;
  reflection: string;
}) => {
  const mutation = db
    .update(bullets)
    .set({ reflection })
    .where(eq(bullets.id, bulletId));
  await mutation;
};

export const deleteBullet = async ({ bulletId }: { bulletId: number }) => {
  const mutation = db.delete(bullets).where(eq(bullets.id, bulletId));
  await mutation;
};
