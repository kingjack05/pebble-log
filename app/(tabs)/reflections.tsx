import { getDatesBetween, getDateStr } from "@/lib/dateTime";
import { cn, range } from "@/lib/utils";
import {
  addHabit,
  getHabitCompletions,
  getHabits,
  getTrackerStore,
  scheduleHabits,
  trackersQueryKeys,
} from "@/localDB/routers/tracker";
import { useMutation, useQuery } from "@tanstack/react-query";
import { add, differenceInCalendarDays, startOfWeek, subWeeks } from "date-fns";
import { useRef, useState } from "react";
import { View, Text, Pressable, Modal, TextInput } from "react-native";

export default function Reflections() {
  return (
    <View className="px-2 pt-1">
      <Text className="text-muted text-xl">Trackers</Text>
      <Tracker />
    </View>
  );
}

const Tracker = () => {
  const { data: habits } = useQuery({
    queryKey: trackersQueryKeys.habits,
    queryFn: getHabits,
  });
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const { mutate } = useMutation({ mutationFn: addHabit });
  const { mutate: scheduleHabitsMutate } = useMutation({
    mutationFn: scheduleHabits,
  });
  const newHabitInputRef = useRef<TextInput>(null);

  if (!habits) return;

  return (
    <>
      <Days />
      {habits.map((i) => {
        return (
          <View key={i.id}>
            <HabitCompletionRow habitId={i.id} title={i.title} />
          </View>
        );
      })}
      <View className="h-0.5 bg-card mt-1 mb-0.5" />
      <Score />
      <Pressable
        onPress={() => {
          setIsAddHabitModalOpen(true);
        }}
      >
        <Text className="text-muted text-lg italic py-1">+ Add</Text>
      </Pressable>
      <Modal
        visible={isAddHabitModalOpen}
        onShow={() => {
          setTimeout(() => {
            newHabitInputRef.current?.focus();
          }, 100);
        }}
        transparent
      >
        <Pressable
          className="flex-1 justify-center items-center"
          onPress={(event) =>
            event.target == event.currentTarget && setIsAddHabitModalOpen(false)
          }
        >
          <View className="w-80 rounded bg-card p-6">
            <Text className="text-muted text-sm pt-1">NAME</Text>
            <TextInput
              className="text-foreground placeholder:text-muted text-lg pb-2"
              ref={newHabitInputRef}
              value={newHabitName}
              onChangeText={(text) => {
                setNewHabitName(text);
              }}
              placeholder="Habit Name"
            />
            <Pressable
              className="mt-20 p-2 flex items-center border border-foreground"
              onPress={() => {
                mutate(
                  { title: newHabitName },
                  {
                    onSuccess: () => {
                      scheduleHabitsMutate();
                      setIsAddHabitModalOpen(false);
                    },
                  }
                );
              }}
            >
              <Text className="text-foreground text-lg">Add</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const Days = () => {
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
  const weekday = new Date().getDay();
  return (
    <View className="flex-row w-full justify-evenly">
      <View className="flex-grow-0 w-24" />
      <View className="flex-grow">
        <View className="flex flex-row justify-around">
          {days.map((i, index) => {
            return (
              <View key={i}>
                <Text
                  style={{ width: 20 }}
                  className={cn(
                    weekday === index ? "text-foreground" : "text-muted"
                  )}
                >
                  {i}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};
const HabitCompletionRow = ({
  habitId,
  title,
}: {
  habitId: number;
  title: string;
}) => {
  const today = new Date();
  const thisSunday = startOfWeek(today, { weekStartsOn: 0 });
  const lastSunday = subWeeks(thisSunday, 1);
  const lastSundayStr = getDateStr(lastSunday);
  const thisSaturday = add(thisSunday, { days: 6 });
  const thisSaturdayStr = getDateStr(thisSaturday);

  const { data: habitCompletions } = useQuery({
    queryKey: trackersQueryKeys.habitCompletions(
      habitId,
      lastSundayStr,
      thisSaturdayStr
    ),
    queryFn: async () => {
      return await getHabitCompletions({
        habitId,
        fromDate: lastSundayStr,
        toDate: thisSaturdayStr,
      });
    },
  });
  if (!habitCompletions) return;

  const titleMaxLength = 8;
  const datesThisWeek = getDatesBetween(thisSunday, thisSaturday);
  const datesThisWeekStr = datesThisWeek.map(getDateStr);
  const completionsPrevWeek = habitCompletions.filter(
    (i) => !datesThisWeekStr.includes(i.date)
  );
  const streakNodes = ["completed", "neutral"];
  const streakAliveFromPrevWeek = streakNodes.includes(
    completionsPrevWeek.at(-1)?.status ?? ""
  );
  const completionsThisWeek = habitCompletions.filter((i) =>
    datesThisWeekStr.includes(i.date)
  );
  if (completionsThisWeek.length === 0) return;
  function getNeighboringPairs<T>(arr: T[]) {
    return arr.slice(0, -1).map((prev, i) => ({ prev, next: arr[i + 1] }));
  }
  const totalSlots = 7 * 2;
  const slotsHead =
    1 +
    2 *
      differenceInCalendarDays(
        new Date(completionsThisWeek[0].date),
        thisSunday
      );
  const slotsBody = getNeighboringPairs(completionsThisWeek).reduce(
    (sum, { prev, next }) =>
      sum +
      2 * differenceInCalendarDays(new Date(next.date), new Date(prev.date)),
    0
  );
  const slotsTail = totalSlots - slotsHead - slotsBody;
  const streaks = [
    {
      node: completionsThisWeek[0],
      slots: slotsHead,
      streak: streakAliveFromPrevWeek,
    },
    ...getNeighboringPairs(completionsThisWeek).map(({ prev, next }) => ({
      node: next,
      slots:
        2 * differenceInCalendarDays(new Date(next.date), new Date(prev.date)),
      streak:
        streakNodes.includes(prev.status) && streakNodes.includes(next.status),
    })),
    { node: null, slots: slotsTail, streak: false },
  ];

  return (
    <View className="flex-row w-full justify-evenly items-center">
      <View className=" w-24">
        <Text className="text-foreground text-lg py-1">
          {title.length > titleMaxLength
            ? `${title.slice(0, titleMaxLength)}...`
            : title}
        </Text>
      </View>
      <View className="flex-grow">
        <View className="flex-row justify-start">
          {streaks.map((i, index) => (
            <View
              className="flex-row items-center"
              style={{ flex: i.slots }}
              key={index}
            >
              <View
                className={cn(
                  "flex-grow h-0.5 ml-0.5",
                  i.streak ? "bg-foreground" : "bg-transparent"
                )}
              />
              {i.node && (
                <View
                  className={cn("flex-grow-0 rounded-full w-2 h-2 -mr-0.5", {
                    "border border-dotted border-muted":
                      i.node.status === "scheduled",
                    "bg-foreground": i.node.status === "completed",
                    "bg-muted": i.node.status === "neutral",
                  })}
                />
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
const Score = () => {
  const today = new Date();
  const thisSunday = startOfWeek(today, { weekStartsOn: 0 });
  const datesPassedThisWeek = getDatesBetween(thisSunday, today);
  const datesPassedThisWeekStr = datesPassedThisWeek.map(getDateStr);
  const remainingDays = 7 - datesPassedThisWeek.length;

  return (
    <View className="flex-row w-full justify-evenly items-center">
      <View className="w-24">
        <Text className="text-muted text-lg py-1">Score</Text>
      </View>
      <View className="flex-grow">
        <View className="flex-row justify-around items-center">
          {datesPassedThisWeekStr.map((i) => (
            <View key={i}>
              <ScoreForDate date={i} />
            </View>
          ))}
          {range(0, remainingDays).map((i, index) => (
            <View key={index} className="h-1" style={{ width: 20 }} />
          ))}
        </View>
      </View>
    </View>
  );
};
const ScoreForDate = ({ date }: { date: string }) => {
  const { data } = useQuery({
    queryKey: trackersQueryKeys.trackerScoreForDate(date),
    queryFn: async () => {
      return await getTrackerStore({ date });
    },
  });
  if (!data) return;

  const score = Math.floor(data * 100);
  return (
    <View>
      <Text className="text-foreground">{score}</Text>
    </View>
  );
};
