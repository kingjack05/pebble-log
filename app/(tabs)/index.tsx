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
import { Text, TextInput, View } from "react-native";

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
    <View className="mt-1 ml-2">
      <View className="flex flex-row justify-start items-baseline">
        <Text className="text-muted text-xs w-20">DAILY LOG</Text>
        <CollectionTitle collectionId={collectionId} title={title} />
      </View>

      {bullets.map(({ bullets }) => (
        <View key={bullets.id}>
          <Bullet id={bullets.id} text={bullets.text} />
        </View>
      ))}
      <NewBullet
        order={bullets.length + 1}
        collectionId={collectionId}
        afterBulletCreatedCB={collectionBulletsQ.refetch}
      />
    </View>
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
  const [inputWidth, setInputWidth] = useState(minInputWidth);
  const hiddenText = useRef<Text>(null);
  const updateTitleM = updateCollectionTitle();

  const updateInputWidth = useCallback(() => {
    // Setting input width dynamically here to prevent flickering
    if (hiddenText.current) {
      hiddenText.current.measure((x, y, measuredWidth) => {
        setInputWidth(Math.max(minInputWidth, measuredWidth + 20)); // Add padding and set minimum width
      });
    }
  }, []);
  useEffect(() => {
    updateInputWidth();
  }, []);

  return (
    <>
      <TextInput
        style={{ width: inputWidth }}
        className="border-b border-dotted border-muted text-foreground text-lg"
        value={text}
        onChangeText={(val) => {
          setText(val);
          updateInputWidth();
        }}
        onEndEditing={() => {
          updateTitleM.mutateAsync({ collectionId, title: text }).then(() => {
            console.log("Edited");
          });
        }}
      />
      <Text ref={hiddenText} className="opacity-0 absolute text-lg">
        {text}
      </Text>
    </>
  );
}

function Bullet({ id, text }: { id: number; text: string }) {
  return <Text className="text-foreground">{text}</Text>;
}

function NewBullet({
  order,
  collectionId,
  afterBulletCreatedCB,
}: {
  order: number;
  collectionId: number;
  afterBulletCreatedCB: Function;
}) {
  const [text, setText] = useState("");
  const [type, setType] =
    useState<Parameters<typeof addBulletToCollection>[1]>("null");
  const addBulletM = addBulletToCollection(text, type, order, collectionId);

  return (
    <View>
      <TextInput
        className="border-b border-solid border-gray-600 w-20 text-foreground placeholder:text-muted"
        value={text}
        onChangeText={setText}
        onEndEditing={() => {
          addBulletM.mutateAsync().then(() => {
            afterBulletCreatedCB();
          });
        }}
        placeholder="New bullet"
      />
    </View>
  );
}
