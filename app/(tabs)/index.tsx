import { Collection } from "@/components/Collection";
import { FilterModal } from "@/components/Collection/FilterModal";
import {
  CheckCircleIcon,
  CircleIcon,
  FilterIcon,
  MinusCircleIcon,
} from "@/components/icons";
import { getDateStr } from "@/lib/dateTime";
import { cn } from "@/lib/utils";
import {
  createDailyLog,
  getDailyLogForToday,
} from "@/localDB/routers/collection";
import {
  getHabitCompletionsForDay,
  trackersQueryKeys,
  updateHabitCompletionStatus,
} from "@/localDB/routers/tracker";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, FlatList } from "react-native";

export default function Index() {
  const day = new Date();
  const dateStr = getDateStr(day);
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
      <View className="py-2 rounded mx-2 flex-row">
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
      <Habits date={dateStr} />
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

const Habits = ({ date }: { date: string }) => {
  const { data } = useQuery({
    queryKey: trackersQueryKeys.habitCompletionsByDate(date),
    queryFn: async () => {
      return await getHabitCompletionsForDay({ date });
    },
  });
  const { mutate } = useMutation({ mutationFn: updateHabitCompletionStatus });

  if (!data) return;

  return (
    <>
      <FlatList
        className="flex-grow-0"
        contentContainerClassName="p-1"
        data={data}
        numColumns={2}
        renderItem={({ item }) => (
          <Pressable
            className={cn(
              "bg-card m-1 rounded p-1 flex-1 flex-row items-center"
            )}
            onPress={() => {
              const statusCurr = item.habitCompletions.status;
              const nextStatusMap = {
                scheduled: "completed",
                completed: "neutral",
                neutral: "scheduled",
              } as const;
              const statusNext = nextStatusMap[statusCurr];
              mutate({ ...item.habitCompletions, status: statusNext });
            }}
          >
            <Text className="text-foreground text-lg ml-1 flex-grow">
              {item.habits.title}
            </Text>
            <View className="mr-1">
              {item.habitCompletions.status === "scheduled" && (
                <CircleIcon
                  className="text-foreground"
                  width={18}
                  height={18}
                />
              )}
              {item.habitCompletions.status === "completed" && (
                <CheckCircleIcon
                  className="text-foreground"
                  width={18}
                  height={18}
                />
              )}
              {item.habitCompletions.status === "neutral" && (
                <MinusCircleIcon
                  className="text-foreground"
                  width={18}
                  height={18}
                />
              )}
            </View>
          </Pressable>
        )}
        keyExtractor={(item) => String(item.habits.id)}
      />
    </>
  );
};
