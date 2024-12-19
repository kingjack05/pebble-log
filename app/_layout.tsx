import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { useMigrations } from "drizzle-orm/op-sqlite/migrator";
import migrations from "../drizzle/migrations";
import "../global.css";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { db } from "@/localDB/db";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
