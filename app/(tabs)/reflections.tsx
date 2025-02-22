import { cn } from "@/lib/utils";
import {
  addHabit,
  getHabits,
  trackersQueryKeys,
} from "@/localDB/routers/tracker";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  const newHabitInputRef = useRef<TextInput>(null);

  if (!habits) return;

  return (
    <>
      <Days />
      {habits.map((i) => {
        return (
          <View key={i.id} className="">
            <Text className="text-foreground text-lg py-1">{i.title}</Text>
          </View>
        );
      })}
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
      <View className="flex-grow-0 w-20" />
      <View className="flex-grow flex-row justify-evenly">
        {days.map((i, index) => {
          return (
            <View key={i} className="col-span-1">
              <Text
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
  );
};
const HabitCompletionRow = () => {
  return <View></View>;
};

const NewHabitModal = () => {};
