import {
  setSecureConfig,
  SecureConfigQueryKeys,
  getOAuthConfigs,
} from "@/lib/secureStore";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useEffect } from "react";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";

// Endpoint
const discovery = {
  authorizationEndpoint: "https://www.fitbit.com/oauth2/authorize",
  tokenEndpoint: "https://api.fitbit.com/oauth2/token",
  revocationEndpoint: "https://api.fitbit.com/oauth2/revoke",
};

export default function OAuthPage() {
  const { data } = useQuery({
    queryKey: SecureConfigQueryKeys.oauth(),
    queryFn: getOAuthConfigs,
  });
  const { mutate } = useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      await setSecureConfig("oauth.fitbit.clientId", clientId);
    },
  });

  if (!data) return;

  return (
    <View className="px-4">
      <Text className="text-2xl pt-1 mb-3 text-muted">OAuth</Text>
      <Text className="text-xl pt-1 mb-3 text-muted">Fitbit</Text>
      <Text className="text-muted mb-2">ClientID</Text>
      <TextInput
        className=" bg-card text-foreground w-full text-lg p-2 rounded-lg mb-3"
        defaultValue={data.fitbit.clientId ?? ""}
        onSubmitEditing={({ nativeEvent: { text } }) => {
          mutate({ clientId: text });
        }}
      />
      <GetRefreshTokenButton clientId={data.fitbit.clientId ?? ""} />
    </View>
  );
}

const GetRefreshTokenButton = ({ clientId }: { clientId: string }) => {
  const redirectUri = makeRedirectUri({
    scheme: "com.kingjack05.pebblelog",
    path: "settings/oauth",
  });
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      scopes: [
        "activity",
        "cardio_fitness",
        "electrocardiogram",
        "heartrate",
        "irregular_rhythm_notifications",
        "location",
        "nutrition",
        "oxygen_saturation",
        "profile",
        "respiratory_rate",
        "settings",
        "sleep",
        "social",
        "temperature",
        "weight",
      ],
      redirectUri,
    },
    discovery
  );
  console.log(request, response);
  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      console.log(response.params);
    }
  }, [response]);

  const requestReady = !!request;

  return (
    <Pressable
      disabled={!requestReady}
      className="bg-card mt-4 rounded p-2 w-40 flex items-center justify-center"
      onPress={() => {
        promptAsync();
      }}
    >
      <Text className={cn(!requestReady ? "text-muted" : "text-foreground")}>
        {"Fetch Token"}
      </Text>
    </Pressable>
  );
};
