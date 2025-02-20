import { Collection } from "@/components/Collection";
import { FilterModal } from "@/components/Collection/FilterModal";
import { FilterIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  createDailyLog,
  getDailyLogForToday,
} from "@/localDB/routers/collection";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";

export default function Index() {
  const createDailyLogM = createDailyLog();
  const getDailyLogForTodayQ = getDailyLogForToday();
  const createDailyLogFunc = createDailyLogM.mutateAsync;
  const [showFiltersModal, setShowFiltersModal] = useState(false);

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
      <View className="py-2 rounded mx-2 flex-row ">
        <View className="flex-grow">
          <Text className="text-muted text-2xl text-center">
            {dailyLog.title}
          </Text>
        </View>
        <View className="flex-grow-0 mr-4 flex-row">
          <Pressable
            className="pt-1"
            onPress={() => {
              setShowFiltersModal(true);
            }}
          >
            <FilterIcon
              className={cn(
                dailyLog.filters.length > 0 ? "text-foreground" : "text-muted"
              )}
            />
          </Pressable>
        </View>
      </View>
      <Collection collectionId={dailyLog.id} />
      <Modal
        visible={showFiltersModal}
        transparent
        onRequestClose={() => {
          setShowFiltersModal(false);
        }}
      >
        <Pressable
          className="flex-1 justify-center items-center"
          onPress={(event) =>
            event.target == event.currentTarget && setShowFiltersModal(false)
          }
        >
          <View className="w-80 rounded bg-card p-6">
            <FilterModal id={dailyLog.id} />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
