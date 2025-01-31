import { CloudIcon } from "@/components/icons";
import { Link } from "expo-router";
import React from "react";
import { View, Text, TextInput } from "react-native";

export default function SettingsPage() {
  return (
    <>
      <View className="px-4">
        <Text className="text-2xl pt-1 mb-3 text-muted">Settings</Text>
        <Link href="/settings/backup" className=" bg-card p-4 rounded-lg pl-3">
          <View className="flex-row items-center">
            <CloudIcon className="text-foreground" />
            <Text className="text-foreground text-xl pl-3">Backup</Text>
          </View>
        </Link>
      </View>
    </>
  );
}
