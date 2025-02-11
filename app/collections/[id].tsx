import React from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { Collection } from "@/components/Collection";
import {
  updateCollectionPinned,
  useCollectionQuery,
} from "@/localDB/routers/collection";
import { FeatherIcon } from "@/components/icons";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const { data } = useCollectionQuery(Number(id));
  const { mutate } = useMutation({ mutationFn: updateCollectionPinned });

  if (!data) return <Text>Loading...</Text>;
  return (
    <>
      <View className="py-2 rounded mx-2 flex-row ">
        <View className="flex-grow">
          <Text className="text-foreground text-2xl text-center">
            {data.title}
          </Text>
        </View>
        <View className="flex-grow-0 mr-4">
          <Pressable
            className="pt-1"
            onPress={() => {
              mutate({ collectionId: data.id, pinned: !data.pinned });
            }}
          >
            <FeatherIcon
              className={cn(data.pinned ? "text-foreground" : "text-muted")}
            />
          </Pressable>
        </View>
      </View>
      <Collection collectionId={data.id} />
    </>
  );
}
