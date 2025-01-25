import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { useMigrations } from "drizzle-orm/op-sqlite/migrator";
import migrations from "../drizzle/migrations";
import "../global.css";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { db } from "@/localDB/db";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "nativewind";
import { cn } from "@/lib/utils";
import { SafeAreaView } from "react-native-safe-area-context";

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  }),
});
export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const { colorScheme } = useColorScheme();

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
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{ headerShown: false }}
          screenLayout={({ children }) => {
            return (
              <SafeAreaView
                className={cn(
                  "flex-1 bg-background text-foreground",
                  colorScheme === "dark" && "dark"
                )}
              >
                {children}
              </SafeAreaView>
            );
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
