import React, { useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import { Text, TextInput } from "react-native";
import {
  updateBulletReflection,
  useBulletDetail,
} from "@/localDB/routers/bullets";
import { useDebounce } from "@/hooks/debounce";
import { useMutation } from "@tanstack/react-query";

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const bulletId = Number(id);
  const { data } = useBulletDetail({ bulletId });
  const { mutate } = useMutation({ mutationFn: updateBulletReflection });
  const updateBulletTextDebounced = useDebounce((text: string) => {
    mutate({ bulletId, reflection: text });
  });
  if (!data) return null;

  const { text, reflection } = data;
  return (
    <>
      <Text className="text-muted text-2xl text-center py-1">{text}</Text>
      <TextInput
        defaultValue={reflection ?? ""}
        onChangeText={updateBulletTextDebounced}
        multiline
        className="flex-1 text-foreground placeholder:text-muted align-top pl-6 pt-2 text-lg "
        placeholder="Reflections..."
      />
    </>
  );
}
