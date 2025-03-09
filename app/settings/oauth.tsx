import {
  setSecureConfig,
  SecureConfigQueryKeys,
  getOAuthConfigs,
  setFitbitAccessToken,
} from "@/lib/secureStore";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useEffect } from "react";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { getRefreshToken } from "@/external/fitbit";

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
  const { mutate: setClientID } = useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      await setSecureConfig("oauth.fitbit.clientId", clientId);
    },
  });
  const { mutate: setClientSecret } = useMutation({
    mutationFn: async ({ clientSecret }: { clientSecret: string }) => {
      await setSecureConfig("oauth.fitbit.clientSecret", clientSecret);
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
          setClientID({ clientId: text });
        }}
      />
      <Text className="text-muted mb-2">Client Secret</Text>
      <TextInput
        className=" bg-card text-foreground w-full text-lg p-2 rounded-lg mb-3"
        secureTextEntry
        defaultValue={data.fitbit.clientSecret ?? ""}
        onSubmitEditing={({ nativeEvent: { text } }) => {
          setClientSecret({ clientSecret: text });
        }}
      />
      <GetRefreshTokenButton
        clientId={data.fitbit.clientId ?? ""}
        clientSecret={data.fitbit.clientSecret ?? ""}
      />
    </View>
  );
}

const GetRefreshTokenButton = ({
  clientId,
  clientSecret,
}: {
  clientId: string;
  clientSecret: string;
}) => {
  const redirectUri = makeRedirectUri({
    scheme: "com.kingjack05.pebblelog",
    path: "settings/oauth",
  });
  const [res, setRes] = useState("");
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
  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;

      getRefreshToken({
        code,
        codeVerifier: request?.codeVerifier ?? "",
        clientId,
        clientSecret,
        redirectUri,
      }).then(({ access_token, expires_in, refresh_token, user_id }) => {
        setRes(JSON.stringify({ access_token, expires_in, refresh_token }));
        setSecureConfig("oauth.fitbit.userID", user_id);
        setFitbitAccessToken({
          accessToken: access_token,
          refreshToken: refresh_token,
        });
      });
    }
  }, [response]);

  const requestReady = !!request;

  return (
    <>
      <Pressable
        disabled={!requestReady}
        className="bg-card mt-4 rounded p-2 w-40 flex items-center justify-center"
        onPress={() => {
          promptAsync();
        }}
      >
        <Text className={cn(!requestReady ? "text-muted" : "text-foreground")}>
          Refresh Token
        </Text>
      </Pressable>
      <Text className="text-foreground">{res}</Text>
    </>
  );
};
