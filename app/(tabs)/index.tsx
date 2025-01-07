import {
  Bullet,
  BulletTypeEditorKeyboardToolbar,
  NewBullet,
} from "@/components/Bullet";
import { useKeyboard } from "@/hooks/keyboard";
import { cn } from "@/lib/utils";
import { getCollectionBullets } from "@/localDB/routers/bullets";
import {
  createDailyLog,
  getDailyLogForToday,
  updateCollectionTitle,
} from "@/localDB/routers/collection";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

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
    <DailyLog
      collectionId={dailyLog.id}
      title={dailyLog.title}
      titleEditedCB={getDailyLogForTodayQ.refetch().then}
    />
  );
}

function DailyLog({
  collectionId,
  title,
}: {
  collectionId: number;
  title: string;
  titleEditedCB: Function;
}) {
  const collectionBulletsQ = getCollectionBullets(collectionId);
  const bullets = collectionBulletsQ.data;
  const { open } = useKeyboard();
  if (!bullets) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <View className="flex-1">
        <ScrollView>
          <View className="flex flex-row justify-start items-baseline mb-2">
            <Text className="text-muted text-base w-32 text-center border border-dashed border-muted mr-2">
              DAILY LOG
            </Text>
            <CollectionTitle collectionId={collectionId} title={title} />
          </View>

          {bullets.map(({ bullets }) => (
            <View key={bullets.id}>
              <Bullet
                id={bullets.id}
                initText={bullets.text}
                initType={bullets.type}
              />
            </View>
          ))}
          <NewBullet
            order={bullets.length + 1}
            collectionId={collectionId}
            afterBulletCreatedCB={collectionBulletsQ.refetch}
          />
        </ScrollView>
      </View>
      <View className={cn("flex-none text-foreground", !open && "hidden")}>
        <BulletTypeEditorKeyboardToolbar />
      </View>
    </>
  );
}

function CollectionTitle({
  collectionId,
  title,
}: {
  collectionId: number;
  title: string;
}) {
  const [text, setText] = useState(title);
  const minInputWidth = 36;
  const [underlineWidth, setUnderlineWidth] = useState(minInputWidth);
  const hiddenText = useRef<Text>(null);
  const updateTitleM = updateCollectionTitle();

  return (
    <>
      <View className="relative flex-1">
        <TextInput
          className="text-foreground text-xl flex-0"
          defaultValue={title}
          onChangeText={(val) => {
            setText(val);
          }}
          onEndEditing={() => {
            updateTitleM
              .mutateAsync({ collectionId, title: text })
              .then(() => {});
          }}
          onLayout={(event) => {
            setUnderlineWidth(event.nativeEvent.layout.width);
          }}
        />
        <View
          className="absolute bottom-0 left-0 h-[1px] w-20 border-muted border-dotted border"
          style={{ width: underlineWidth }}
        />
      </View>

      <Text
        ref={hiddenText}
        onLayout={(event) => {
          setUnderlineWidth(event.nativeEvent.layout.width);
        }}
        className="opacity-0 absolute text-xl"
      >
        {text}
      </Text>
    </>
  );
}
