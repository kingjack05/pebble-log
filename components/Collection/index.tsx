import {
  Bullet,
  BulletReflectionLink,
  BulletTypeEditorKeyboardToolbar,
  NewBullet,
} from "@/components/Bullet";
import { useKeyboard } from "@/hooks/keyboard";
import { cn } from "@/lib/utils";
import { useCollectionBullets } from "@/localDB/routers/bullets";
import {
  reorderBullet,
  useCollectionQuery,
} from "@/localDB/routers/collection";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

export function Collection({ collectionId }: { collectionId: number }) {
  const { data } = useCollectionQuery(collectionId);
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

  if (!bullets || !data) {
    return <Text>Loading...</Text>;
  }
  const hiddenBulletTypes = data.filters
    .filter((i) => i.type === "bulletType.hide")
    .map((i) => i.value);
  const bulletsFiltered = bullets.filter(
    (i) => !hiddenBulletTypes.includes(i.bullets.type)
  );

  return (
    <>
      <View className="flex-1">
        <ScrollView scrollEnabled={draggedIndex === undefined}>
          <View className="relative">
            <Animated.View
              className="absolute h-2 bg-muted w-full"
              style={draggableBarStyle}
            ></Animated.View>
            {bulletsFiltered.map(({ bullets: bullet }, index) => (
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
                    const dragBefore = translateY.value < 0;
                    const dragTargetBulletIndex = Math.max(
                      0,
                      Math.min(
                        index +
                          Math.floor(translateY.value / bulletHeight) +
                          (dragBefore ? 1 : 0),
                        bulletsFiltered.length
                      )
                    );
                    const targetBulletId =
                      bulletsFiltered[dragTargetBulletIndex].bullets.id;
                    mutate(
                      {
                        bulletId: bullet.id,
                        collectionId,
                        targetBulletId,
                        position: dragBefore ? "before" : "after",
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
              order={(bulletsFiltered.length + 1) * 100}
              collectionId={collectionId}
            />
          </View>
        </ScrollView>
      </View>
      <View className={cn("flex-none text-foreground", !open && "hidden")}>
        <BulletReflectionLink />
        <BulletTypeEditorKeyboardToolbar />
      </View>
    </>
  );
}
