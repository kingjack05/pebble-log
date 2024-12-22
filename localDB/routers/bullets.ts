import { useMutation, useQuery } from "@tanstack/react-query";
import { db } from "../db";
import { Bullet, bullets, bulletsToCollections } from "../schema";
import { eq } from "drizzle-orm";

export const getCollectionBullets = (collectionId: number) =>
  useQuery({
    queryKey: ["collectionBullets", collectionId],
    queryFn: async () => {
      const res = await db
        .select()
        .from(bulletsToCollections)
        .innerJoin(bullets, eq(bulletsToCollections.bulletId, bullets.id))
        .where(eq(bulletsToCollections.collectionId, collectionId))
        .all();
      return res;
    },
  });

export const addBulletToCollection = (
  text: string,
  type: Bullet["type"],
  order: number,
  collectionId: number
) =>
  useMutation({
    mutationFn: async () => {
      const createBullet = db.insert(bullets).values({ text, type });
      const createdBullet = await createBullet.returning({ id: bullets.id });
      const bulletId = createdBullet[0].id;
      const addBulletToCollection = db
        .insert(bulletsToCollections)
        .values({ bulletId, collectionId, order });
      await addBulletToCollection;
    },
  });
