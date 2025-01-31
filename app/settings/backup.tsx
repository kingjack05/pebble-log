import { setSecureConfig, getBackupConfigs } from "@/lib/secureStore";
import { cn } from "@/lib/utils";
import { syncDBFile } from "@/localDB/db";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";

export default function BackupPage() {
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: getBackupConfigs,
  });
  const { mutate, status } = useMutation({ mutationFn: syncDBFile });

  const syncButtonDisabled = status === "pending" || status === "success";

  if (!data) return;

  return (
    <View className="px-4">
      <Text className="text-2xl pt-1 mb-3 text-muted">Backup</Text>
      <Text className="text-muted mb-2">Endpoint</Text>
      <TextInput
        className=" bg-card text-foreground w-full text-lg p-2 rounded-lg mb-3"
        defaultValue={data.endpoint ?? ""}
        onSubmitEditing={({ nativeEvent: { text } }) => {
          setSecureConfig("backup.s3.endpoint", text);
        }}
      />
      <Text className="text-muted mb-2">Region</Text>
      <TextInput
        className=" bg-card text-foreground w-full text-lg p-2 rounded-lg mb-3"
        defaultValue={data.region ?? ""}
        onSubmitEditing={({ nativeEvent: { text } }) => {
          setSecureConfig("backup.s3.region", text);
        }}
      />
      <Text className="text-muted mb-2">Bucket</Text>
      <TextInput
        className=" bg-card text-foreground w-full text-lg p-2 rounded-lg mb-3"
        defaultValue={data.bucket ?? ""}
        onSubmitEditing={({ nativeEvent: { text } }) => {
          setSecureConfig("backup.s3.bucket", text);
        }}
      />
      <Text className="text-muted mb-2">Key ID</Text>
      <TextInput
        secureTextEntry
        className=" bg-card text-foreground w-full text-lg p-2 rounded-lg mb-3"
        defaultValue={data.keyID ?? ""}
        onSubmitEditing={({ nativeEvent: { text } }) => {
          setSecureConfig("backup.s3.keyID", text);
        }}
      />
      <Text className="text-muted mb-2">Key</Text>
      <TextInput
        secureTextEntry
        className=" bg-card text-foreground w-full text-lg p-2 rounded-lg mb-3"
        defaultValue={data.key ?? ""}
        onSubmitEditing={({ nativeEvent: { text } }) => {
          setSecureConfig("backup.s3.key", text);
        }}
      />
      <Pressable
        disabled={syncButtonDisabled}
        className="bg-card mt-4 rounded p-2 w-40 flex items-center justify-center"
        onPress={() => {
          mutate();
        }}
      >
        <Text
          className={cn(syncButtonDisabled ? "text-muted" : "text-foreground")}
        >
          {status === "pending"
            ? "Syncing..."
            : status === "success"
            ? "Synced Sucessfully"
            : "Sync Manually"}
        </Text>
      </Pressable>
    </View>
  );
}
