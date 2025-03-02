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
import * as SplashScreen from "expo-splash-screen";
import { db } from "@/localDB/db";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "nativewind";
import { cn } from "@/lib/utils";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useEffect, useState } from "react";
import { scheduleHabits } from "@/localDB/routers/tracker";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  }),
});
export default function RootLayout() {
  const { success: migrationSucceeded, error } = useMigrations(db, migrations);
  const { colorScheme } = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        if (migrationSucceeded) {
          await scheduleHabits();
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady || !migrationSucceeded) return;

  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView onLayout={onLayoutRootView}>
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
