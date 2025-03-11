import { Collection } from "@/components/Collection";
import { FilterModal } from "@/components/Collection/FilterModal";
import {
  CheckCircleIcon,
  CircleIcon,
  FilterIcon,
  MinusCircleIcon,
} from "@/components/icons";
import { useKeyboard } from "@/hooks/keyboard";
import { getDateStr } from "@/lib/dateTime";
import { cn } from "@/lib/utils";
import {
  collectionKeys,
  getDailyLogAndCreateIfEmpty,
} from "@/localDB/routers/collection";
import {
  getHabitCompletionsForDay,
  trackersQueryKeys,
  updateHabitCompletionStatus,
} from "@/localDB/routers/tracker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { add } from "date-fns";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, FlatList } from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

export default function Index() {
  const [dateOffset, setDateOffset] = useState(0);
  const day = add(new Date(), { days: dateOffset });
  const dateStr = getDateStr(day);
  const swipeRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd((e) => {
      setDateOffset((val) => val - 1);
    })
    .runOnJS(true);
  const swipeLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd((e) => {
      setDateOffset((val) => val + 1);
    })
    .runOnJS(true);

  return (
    <>
      <GestureDetector gesture={swipeRight}>
        <GestureDetector gesture={swipeLeft}>
          <View className="flex-1">
            <DailyLog date={dateStr} />
          </View>
        </GestureDetector>
      </GestureDetector>
    </>
  );
}

const DailyLog = ({ date }: { date: string }) => {
  const { data: dailyLog } = useQuery({
    queryKey: collectionKeys.daily(date),
    queryFn: async () => {
      return await getDailyLogAndCreateIfEmpty({ date });
    },
  });
  const { open } = useKeyboard();
  const queryClient = useQueryClient();
  useEffect(() => {
    const prevDayStr = getDateStr(add(new Date(date), { days: -1 }));
    const nextDayStr = getDateStr(add(new Date(date), { days: 1 }));
    const prefetch = async () => {
      await queryClient.prefetchQuery({
        queryKey: collectionKeys.daily(prevDayStr),
        queryFn: async () => {
          return await getDailyLogAndCreateIfEmpty({ date: prevDayStr });
        },
      });
      await queryClient.prefetchQuery({
        queryKey: collectionKeys.daily(nextDayStr),
        queryFn: async () => {
          return await getDailyLogAndCreateIfEmpty({ date: nextDayStr });
        },
      });
    };
    prefetch();
  }, []);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  if (!dailyLog) return;

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
      <View className={cn(open && "hidden")}>
        <Habits date={date} />
      </View>
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
};

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
