import { Link } from "expo-router";
import { View, Text } from "react-native";

export default function Others() {
  return (
    <View className="flex flex-col justify-center items-center pt-10">
      <Link className="text-foreground underline text-lg" href="/settings">Settings</Link>
    </View>
  );
}
