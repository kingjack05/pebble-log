import {
  Bullet,
  BulletTypeEditorKeyboardToolbar,
  NewBullet,
} from "@/components/Bullet";
import { useKeyboard } from "@/hooks/keyboard";
import { cn } from "@/lib/utils";
import { useCollectionBullets } from "@/localDB/routers/bullets";
import {
  reorderBullet,
  updateCollectionTitle,
} from "@/localDB/routers/collection";
import { CollectionType } from "@/localDB/schema";
import React, { useRef, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

export function Collection({
  collectionId,
  collectionType,
  title,
}: {
  collectionId: number;
  collectionType: CollectionType;
  title: string;
}) {
  const collectionBulletsQ = useCollectionBullets(collectionId);
  const bullets = collectionBulletsQ.data;
  const { open } = useKeyboard();

  const [draggedIndex, setDraggedIndex] = useState<number | undefined>();
  const translateY = useSharedValue(0);
  const bulletHeight = 36; // current implementation currently relies on bullet height being fixed
  const draggableBarStyle = useAnimatedStyle(() => {
    if (
      draggedIndex === undefined ||
      !bullets ||
      Math.abs(translateY.value) < bulletHeight
    )
      return { opacity: 0 };

    const dragToIndex = Math.max(
      0,
      Math.min(
        draggedIndex + 1 + Math.floor(translateY.value / bulletHeight),
        bullets.length
      )
    );
    const barY = dragToIndex * bulletHeight;

    return {
      opacity: 1,
      transform: [
        {
          translateY: barY,
        },
      ],
    };
  });
  const { mutate } = useMutation({ mutationFn: reorderBullet });

  if (!bullets) {
    return <Text>Loading...</Text>;
  }

  const collectionTypeText = {
    daily: "DAILY LOG",
    weekly: "WEEKLY LOG",
    monthly: "MONTHLY LOG",
    custom: "CUSTOM",
  }[collectionType];

  return (
    <>
      <View className="flex-1">
        <ScrollView scrollEnabled={draggedIndex === undefined}>
          <View className="flex flex-row justify-start items-baseline mb-2">
            <Text className="text-muted text-base w-32 text-center border border-dashed border-muted mr-2">
              {collectionTypeText}
            </Text>
            <CollectionTitle collectionId={collectionId} title={title} />
          </View>

          <View className="relative">
            <Animated.View
              className="absolute h-2 bg-muted w-full"
              style={draggableBarStyle}
            ></Animated.View>
            {bullets.map(({ bullets: bullet }, index) => (
              <View key={bullet.id}>
                <Bullet
                  id={bullet.id}
                  initText={bullet.text}
                  initType={bullet.type}
                  onStartDrag={(e) => {
                    setDraggedIndex(index);
                  }}
                  onDragBullet={(e) => {
                    translateY.value = e.translationY;
                  }}
                  onEndDrag={() => {
                    setDraggedIndex(undefined);
                    const dragToIndex = Math.max(
                      0,
                      Math.min(
                        index + 1 + Math.floor(translateY.value / bulletHeight),
                        bullets.length
                      )
                    );
                    mutate(
                      {
                        bulletId: bullet.id,
                        collectionId,
                        toIndex: dragToIndex,
                      },
                      {
                        onError(error, variables, context) {
                          console.log(error.stack);
                        },
                      }
                    );
                  }}
                />
              </View>
            ))}
            <NewBullet
              order={(bullets.length + 1) * 100}
              collectionId={collectionId}
            />
          </View>
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
