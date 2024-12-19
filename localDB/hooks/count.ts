import { useMutation, useQuery } from "@tanstack/react-query";
import { db } from "../db";
import { countTable } from "../schema";

export function useCount() {
  const count = useQuery({
    queryKey: ["count"],
    queryFn: () => {
      const countRes = db.$count(countTable);
      return countRes;
    },
  });
  const currentCount = count.data;
  if (!currentCount) {
    return { count };
  }

  const increment = useMutation({
    mutationKey: ["count.increment"],
    mutationFn: () => {
      return db.update(countTable).set({ count: currentCount + 1 });
    },
  });

  return { count, increment };
}
