import React, { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, Pressable, Modal } from "react-native";
import { Collection } from "@/components/Collection";
import {
  updateCollectionFilters,
  updateCollectionPinned,
  useCollectionQuery,
} from "@/localDB/routers/collection";
import { FeatherIcon, FilterIcon } from "@/components/icons";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { bulletTypes } from "@/localDB/schema";
import { BulletTypeToIcon } from "@/components/Bullet/icons";

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const { data } = useCollectionQuery(Number(id));
  const { mutate } = useMutation({ mutationFn: updateCollectionPinned });
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  if (!data) return <Text>Loading...</Text>;
  return (
    <>
      <View className="py-2 rounded mx-2 flex-row ">
        <View className="flex-grow">
          <Text className="text-foreground text-2xl text-center">
            {data.title}
          </Text>
        </View>
        <View className="flex-grow-0 mr-4 flex-row">
          <Pressable
            className="pt-1 mr-3"
            onPress={() => {
              mutate({ collectionId: data.id, pinned: !data.pinned });
            }}
          >
            <FeatherIcon
              className={cn(data.pinned ? "text-foreground" : "text-muted")}
            />
          </Pressable>
          <Pressable
            className="pt-1"
            onPress={() => {
              setShowFiltersModal(true);
            }}
          >
            <FilterIcon
              className={cn(
                data.filters.length > 0 ? "text-foreground" : "text-muted"
              )}
            />
          </Pressable>
        </View>
      </View>
      <Collection collectionId={data.id} />
      <Modal
        visible={showFiltersModal}
        transparent
        onRequestClose={() => {
          setShowFiltersModal(false);
        }}
      >
        <Pressable
          className="flex-1 justify-center items-center"
          onPress={(event) =>
            event.target == event.currentTarget && setShowFiltersModal(false)
          }
        >
          <View className="w-80 rounded bg-card p-6">
            <FilterModal id={Number(id)} />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const FilterModal = ({ id }: { id: number }) => {
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
