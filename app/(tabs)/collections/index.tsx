import { SearchIcon } from "@/components/icons";
import { getCollections } from "@/localDB/routers/collection";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { View, Text, FlatList, useWindowDimensions } from "react-native";

export default function Collections() {
  const { isLoading, data } = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
  });
  const { height } = useWindowDimensions();

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
        renderItem={({ item: { id, title } }) => (
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
        )}
      />
    </View>
  );
}
