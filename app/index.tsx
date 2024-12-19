import { db } from "@/localDB/db";
import { useCount } from "@/localDB/hooks/count";
import { countTable } from "@/localDB/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text, View } from "react-native";

export default function Index() {
  const count = useQuery({
    queryKey: ["count"],
    queryFn: () => {
      const countRes = db.$count(countTable);
      return countRes;
    },
  });

  if (!count.data) {
    return (
      <View className="justify-center items-center flex-1">
        <Text className="text-blue-600">Loading...</Text>
      </View>
    );
  }
  return <CountView count={count.data} />;
}

const CountView = ({ count }: { count: number }) => {
  const queryClient = useQueryClient();
  const increment = useMutation({
    mutationKey: ["count.increment"],
    mutationFn: () => {
      return db.insert(countTable).values({ count: count + 1 });
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ["count"] });
    },
  });

  return (
    <View className="justify-center items-center flex-1">
      <Text className="text-blue-600">
        {count}
        Edit app/index.tsx to edit this screen.
      </Text>
      <Button
        title="Increment"
        onPress={() => {
          increment.mutate();
        }}
      />
    </View>
  );
};
