import React from "react";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { Collection } from "@/components/Collection";
import { useCollectionQuery } from "@/localDB/routers/collection";

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const { data } = useCollectionQuery(Number(id));

  if (!data) return <Text>Loading...</Text>;
  return (
    <>
      <Text className="text-muted text-2xl text-center py-1">{data.title}</Text>
      <Collection collectionId={data.id} />
    </>
  );
}
