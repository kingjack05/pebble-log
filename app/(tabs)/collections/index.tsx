import { FeatherIcon, PlusIcon } from "@/components/icons";
import {
  createCustomCollection,
  getCollections,
} from "@/localDB/routers/collection";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
  Pressable,
  Modal,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";

export default function Collections() {
  const { isLoading, data } = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
  });
  const { height } = useWindowDimensions();
  const [isCreateEntryModalOpen, setIsCreateEntryModalOpen] = useState(false);
  const newEntryInputRef = useRef<TextInput>(null);
  const { mutate } = useMutation({ mutationFn: createCustomCollection });

  if (isLoading || !data)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <View className="flex-1 relative">
      <FlatList
        contentContainerClassName="flex flex-col justify-center items-center"
        contentContainerStyle={{ paddingTop: height * 0.3 }}
        data={data}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item: { id, title, pinned } }) => (
          <View className="flex-row items-center">
            {pinned && (
              <View className="pb-1 mr-1">
                <FeatherIcon
                  className="text-foreground"
                  width={18}
                  height={18}
                />
              </View>
            )}
            <Link
              href={{
                pathname: "/collections/[id]",
                params: { id: String(id) },
              }}
              className="text-foreground underline text-lg"
              style={{ height: 32 }}
            >
              {title}
            </Link>
          </View>
        )}
      />
      <Modal
        visible={isCreateEntryModalOpen}
        onShow={() => {
          setTimeout(() => {
            newEntryInputRef.current?.focus();
          }, 100);
        }}
        transparent
      >
        <Pressable
          className="flex-1 "
          onPress={(event) =>
            event.target == event.currentTarget &&
            setIsCreateEntryModalOpen(false)
          }
        >
          <View className="w-full text-lg rounded bg-background">
            <TextInput
              className="text-foreground placeholder:text-muted text-lg text-center"
              ref={newEntryInputRef}
              onSubmitEditing={({ nativeEvent: { text } }) => {
                mutate(
                  { title: text },
                  {
                    onSuccess: () => {
                      setIsCreateEntryModalOpen(false);
                    },
                  }
                );
              }}
              placeholder="Entry Name"
            />
          </View>
        </Pressable>
      </Modal>
      <Pressable
        onPress={() => {
          setIsCreateEntryModalOpen(!isCreateEntryModalOpen);
        }}
        className="absolute right-3 bottom-3 p-2 bg-muted rounded-full"
      >
        <PlusIcon className="text-foreground" />
      </Pressable>
    </View>
  );
}
