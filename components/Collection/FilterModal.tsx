import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  updateCollectionFilters,
  useCollectionQuery,
} from "@/localDB/routers/collection";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { bulletTypes } from "@/localDB/schema";
import { BulletTypeToIcon } from "@/components/Bullet/icons";

export const FilterModal = ({ id }: { id: number }) => {
  const { data } = useCollectionQuery(Number(id));
  const { mutate } = useMutation({ mutationFn: updateCollectionFilters });

  if (!data) return <Text>Loading...</Text>;
  const hiddenBulletTypes = data.filters
    .filter((i) => i.type === "bulletType.hide")
    .map((i) => i.value);
  return (
    <>
      <Text className="text-foreground">Bullet Types</Text>
      <View className="flex-row">
        {bulletTypes.map((val) => {
          const IconComponent = BulletTypeToIcon[val];
          if (val === "null") {
            return;
          }
          const isHidden = hiddenBulletTypes.includes(val);

          return (
            <Pressable
              key={val}
              style={{ padding: 12, paddingHorizontal: 7 }}
              onPress={() => {
                if (isHidden) {
                  mutate({
                    collectionId: id,
                    filters: data.filters.filter(
                      (i) => i.type === "bulletType.hide" && i.value !== val
                    ),
                  });
                } else {
                  mutate({
                    collectionId: id,
                    filters: [
                      ...data.filters,
                      { type: "bulletType.hide", value: val },
                    ],
                  });
                }
              }}
            >
              <IconComponent
                width={20}
                height={20}
                className={cn(isHidden ? "text-muted" : "text-foreground")}
              />
            </Pressable>
          );
        })}
      </View>
    </>
  );
};
