import React, { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import {
  updateBulletReflection,
  updateBulletTime,
  useBulletDetail,
} from "@/localDB/routers/bullets";
import { MMKV } from "react-native-mmkv";
import { useDebounce } from "@/hooks/debounce";
import { useMutation } from "@tanstack/react-query";
import { PlusIcon, ResetIcon } from "@/components/icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { cn } from "@/lib/utils";

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const bulletId = Number(id);
  const { data } = useBulletDetail({ bulletId });
  const { mutate } = useMutation({ mutationFn: updateBulletReflection });
  const updateBulletTextDebounced = useDebounce((text: string) => {
    mutate({ bulletId, reflection: text });
  });
  if (!data) return null;

  const { text, reflection, time } = data;
  return (
    <>
      <Text className="text-muted text-2xl text-center py-1">{text}</Text>
      <TextInput
        defaultValue={reflection ?? ""}
        onChangeText={updateBulletTextDebounced}
        multiline
        className="flex-1 text-foreground placeholder:text-muted align-top pl-6 pt-2 text-lg "
        placeholder="Reflections..."
      />
      <Time time={time} bulletId={bulletId} />
    </>
  );
}

function utcEpochToDateString(utc: number) {
  const date = new Date(utc);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}
function utcEpochToTimeString(utc: number) {
  const date = new Date(utc);
  return `${date.getHours()}:${date.getMinutes()}`;
}
const Time = ({
  time,
  bulletId,
}: {
  time: {
    start: number;
    end: number;
  }[];
  bulletId: number;
}) => {
  const [isDurationListOpen, setIsDurationListOpen] = useState(false);
  const [isDurationCreatorOpen, setIsDurationCreatorOpen] = useState(false);
  const { mutate } = useMutation({ mutationFn: updateBulletTime });

  const totalMinutes = time
    ? Math.floor(
        time.reduce((prev, curr) => {
          return prev + (curr.end - curr.start) / (60 * 1000);
        }, 0)
      )
    : 0;
  const timeLatest = time.at(-1);

  return (
    <>
      <Modal visible={isDurationListOpen} transparent>
        <Pressable
          className="flex-1 justify-center items-center"
          onPress={(event) =>
            event.target == event.currentTarget && setIsDurationListOpen(false)
          }
        >
          <View className="w-80 rounded bg-card p-6">
            <DurationList time={time} bulletId={bulletId} />
          </View>
        </Pressable>
      </Modal>
      <Modal visible={isDurationCreatorOpen} transparent>
        <Pressable
          className="flex-1 justify-center items-center"
          onPress={(event) =>
            event.target == event.currentTarget &&
            setIsDurationCreatorOpen(false)
          }
        >
          <View className="w-80 text-lg rounded bg-card p-2">
            <DurationCreator
              onAddDuration={({ start, end }) => {
                mutate({ bulletId, time: [...time, { start, end }] });
                setIsDurationCreatorOpen(false);
              }}
              bulletId={bulletId}
            />
          </View>
        </Pressable>
      </Modal>
      <View className="flex-row items-baseline pl-6 mb-4">
        <Pressable
          className="flex-1"
          onPress={() => {
            setIsDurationListOpen(true);
          }}
        >
          <Text className="text-muted">Time</Text>
          <View className="flex-row items-baseline">
            {totalMinutes > 0 ? (
              <>
                <Text className="text-foreground">{String(totalMinutes)}</Text>
                <Text className="text-muted text-sm"> minuets; </Text>
              </>
            ) : null}
            {timeLatest ? (
              <Text className="text-foreground">
                <Text className="text-sm text-muted">
                  {utcEpochToDateString(timeLatest.start)}{" "}
                </Text>
                {utcEpochToTimeString(timeLatest.start)}
                {timeLatest.start !== timeLatest.end ? (
                  utcEpochToDateString(timeLatest.start) ===
                  utcEpochToDateString(timeLatest.end) ? (
                    ` ~ ${utcEpochToTimeString(timeLatest.end)}`
                  ) : (
                    <>
                      {" ~ "}
                      <Text className="text-sm text-muted">
                        {utcEpochToDateString(timeLatest.end)}{" "}
                      </Text>
                      {utcEpochToTimeString(timeLatest.end)}
                    </>
                  )
                ) : (
                  ""
                )}
                <Text className="text-muted text-sm">
                  {time.length > 1 ? `  (+${time.length - 1} more)` : ""}
                </Text>
              </Text>
            ) : (
              <Text> </Text>
            )}
          </View>
        </Pressable>
        <Pressable
          className="p-2 mr-1"
          onPress={() => {
            setIsDurationCreatorOpen(true);
          }}
        >
          <PlusIcon className="text-foreground" />
        </Pressable>
      </View>
    </>
  );
};

const DurationList = ({
  time,
  bulletId,
}: {
  time: {
    start: number;
    end: number;
  }[];
  bulletId: number;
}) => {
  const { mutate } = useMutation({ mutationFn: updateBulletTime });

  const timeWithIndex = time.map((i, index) => ({ ...i, index }));
  const timeSectioned = timeWithIndex.reduce((prev, curr) => {
    const start = new Date(curr.start);
    const startTime = `${start.getHours()}:${start.getMinutes()}`;
    const end = new Date(curr.end);
    const endTime = `${end.getHours()}:${end.getMinutes()}`;
    const date = `${start.getFullYear()}.${
      start.getMonth() + 1
    }.${start.getDate()}`;
    if (date in prev) {
      return {
        ...prev,
        [date]: [...prev[date], { startTime, endTime, index: curr.index }],
      };
    } else {
      return { ...prev, [date]: [{ startTime, endTime, index: curr.index }] };
    }
  }, {} as { [date: string]: { startTime: string; endTime: string; index: number }[] });

  return Object.entries(timeSectioned).map((section) => (
    <View key={section[0]} className="mb-2">
      <Text className="text-muted text-sm mb-0.5">{section[0]}</Text>
      {section[1].map((duration, index) => (
        <View key={index} className="flex-row items-baseline">
          <Text className="text-foreground flex-grow">
            {duration.startTime}
            {duration.startTime !== duration.endTime
              ? ` ~ ${duration.endTime}`
              : ""}
          </Text>
          <Pressable
            className="flex-grow-0 py-1"
            onPress={() => {
              mutate({
                bulletId,
                time: time.filter((i, index) => index !== duration.index),
              });
            }}
          >
            <Text className="text-muted">X</Text>
          </Pressable>
        </View>
      ))}
    </View>
  ));
};

const durationCreatorStorage = new MMKV({ id: "DurationCreator" });
const DurationCreator = ({
  onAddDuration,
  bulletId,
}: {
  onAddDuration: ({ start, end }: { start: number; end: number }) => void;
  bulletId: number;
}) => {
  const storageKeyStart = `${bulletId}.start`;
  const storageKeyEnd = `${bulletId}.end`;
  const now = new Date();

  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");
  const [target, setTarget] = useState<"date" | "start" | "end">("date");

  const [date, setDate] = useState(now);
  const storedStart = durationCreatorStorage.getNumber(storageKeyStart);
  const storedEnd = durationCreatorStorage.getNumber(storageKeyEnd);
  const [start, setStart] = useState(storedStart ? new Date(storedStart) : now);
  const [end, setEnd] = useState(storedEnd ? new Date(storedEnd) : now);
  const [errMsg, setErrMsg] = useState<string>();

  const showMode = (currentMode: "date" | "time") => {
    setShowPicker(true);
    setMode(currentMode);
  };
  const showDatepicker = () => {
    setTarget("date");
    showMode("date");
  };
  const showStartpicker = () => {
    setTarget("start");
    showMode("time");
  };
  const showEndpicker = () => {
    setTarget("end");
    showMode("time");
  };

  return (
    <View className="p-4">
      <Pressable onPress={showDatepicker} className="pt-1 pb-2">
        <Text className="text-muted text-sm">DATE</Text>
        <Text className="text-foreground text-lg">
          {date.getFullYear()}.{date.getMonth() + 1}.{date.getDate()}
        </Text>
      </Pressable>
      <View className="flex-row py-2 items-baseline">
        <Pressable className="flex-grow" onPress={showStartpicker}>
          <Text className="text-muted text-sm">FROM</Text>
          <Text className="text-foreground text-lg">
            {start.getHours()}:{start.getMinutes()}
          </Text>
        </Pressable>
        <Pressable
          className="flex-grow-0"
          onPress={() => {
            const now = new Date();
            setStart(now);
            durationCreatorStorage.set(storageKeyStart, now.getTime());
          }}
        >
          <ResetIcon className="text-foreground" width={20} height={20} />
        </Pressable>
      </View>
      <View className="flex-row py-2 items-baseline">
        <Pressable className="flex-grow" onPress={showEndpicker}>
          <Text className="text-muted text-sm">TO</Text>
          <Text className="text-foreground text-lg">
            {end.getHours()}:{end.getMinutes()}
          </Text>
        </Pressable>
        <Pressable
          className="flex-grow-0"
          onPress={() => {
            const now = new Date();
            setEnd(now);
            durationCreatorStorage.set(storageKeyEnd, now.getTime());
          }}
        >
          <ResetIcon className="text-foreground" width={20} height={20} />
        </Pressable>
      </View>
      <Text className={cn("text-destructive mt-2", !errMsg && "invisible")}>
        {errMsg}
      </Text>
      <Pressable
        className="mt-20 p-2 flex items-center border border-foreground"
        onPress={() => {
          const startWithDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            start.getHours(),
            start.getMinutes()
          );
          const endWithDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            end.getHours(),
            end.getMinutes()
          );
          if (startWithDate > endWithDate) {
            setErrMsg("From must be before To");
            return;
          }
          onAddDuration({
            start: startWithDate.getTime(),
            end: endWithDate.getTime(),
          });
        }}
      >
        <Text className="text-foreground text-lg">Add</Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          mode={mode}
          value={date}
          onChange={(e, date) => {
            setShowPicker(false);
            if (!date) return;
            if (target === "date") setDate(date);
            else if (target === "start") {
              setStart(date);
              durationCreatorStorage.set(storageKeyStart, date.getTime());
            } else if (target === "end") {
              setEnd(date);
              durationCreatorStorage.set(storageKeyEnd, date.getTime());
            }
          }}
        />
      )}
    </View>
  );
};
