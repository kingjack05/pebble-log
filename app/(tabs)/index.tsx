import { Collection } from "@/components/Collection";
import {
  createDailyLog,
  getDailyLogForToday,
} from "@/localDB/routers/collection";
import React, { useEffect } from "react";
import { Text } from "react-native";

export default function Index() {
  const createDailyLogM = createDailyLog();
  const getDailyLogForTodayQ = getDailyLogForToday();
  const createDailyLogFunc = createDailyLogM.mutateAsync;
  const isLoading = getDailyLogForTodayQ.isLoading;
  const dailyLog = getDailyLogForTodayQ.data;
  useEffect(() => {
    if (!isLoading && !dailyLog) {
      createDailyLogFunc()
        .then(() => {
          getDailyLogForTodayQ.refetch().then();
        })
        .catch(console.error);
    }
  }, [isLoading, dailyLog]);

  if (!dailyLog) {
    return <Text>Loading...</Text>;
  }
  return (
    <>
      <Text className="text-muted text-2xl text-center py-1">
        {dailyLog.title}
      </Text>
      <Collection collectionId={dailyLog.id} />
    </>
  );
}
