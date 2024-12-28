import {
  addBulletToCollection,
  getCollectionBullets,
} from "@/localDB/routers/bullets";
import {
  createDailyLog,
  getDailyLogForToday,
} from "@/localDB/routers/collection";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useColorScheme } from "nativewind";
import { cn } from "@/lib/utils";

export default function Index() {
  const { colorScheme } = useColorScheme();
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

  return <DailyLog collectionId={dailyLog.id} title={dailyLog.title} />;
}

function DailyLog({
  collectionId,
  title,
}: {
  collectionId: number;
  title: string;
}) {
  const collectionBulletsQ = getCollectionBullets(collectionId);
  const bullets = collectionBulletsQ.data;

  if (!bullets) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="mt-1 ml-2">
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

function Bullet({ id, text }: { id: number; text: string }) {
  return <Text>{text}</Text>;
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
        className=" border-b border-solid border-gray-600 w-20 placeholder:text-foreground"
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
