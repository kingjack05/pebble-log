import { Bullet, NewBullet } from "@/components/Bullet";
import {
  addBulletToCollection,
  getCollectionBullets,
} from "@/localDB/routers/bullets";
import {
  createDailyLog,
  getDailyLogForToday,
  updateCollectionTitle,
} from "@/localDB/routers/collection";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

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

  if (!bullets) {
    return <Text>Loading...</Text>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="mt-1 ml-2 flex-1 justify-center overflow-scroll"
    >
      <View className="flex flex-row justify-start items-baseline mb-2">
        <Text className="text-muted text-base w-32 text-center border border-dashed border-muted mr-2">
          DAILY LOG
        </Text>
        <CollectionTitle collectionId={collectionId} title={title} />
      </View>

      {bullets.map(({ bullets }) => (
        <View key={bullets.id}>
          <Bullet id={bullets.id} text={bullets.text} type={bullets.type} />
        </View>
      ))}
      <NewBullet
        order={bullets.length + 1}
        collectionId={collectionId}
        afterBulletCreatedCB={collectionBulletsQ.refetch}
      />
    </KeyboardAvoidingView>
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
            updateTitleM.mutateAsync({ collectionId, title: text }).then(() => {
              console.log("Edited");
            });
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
        className="opacity-0 absolute text-lg"
      >
        {text}
      </Text>
    </>
  );
}
