import { useMutation, useQuery } from "@tanstack/react-query";
import {
  setSecureConfig,
  SecureConfigQueryKeys,
  getOAuthConfigs,
  getSecureConfigSync,
  setFitbitAccessToken,
} from "@/lib/secureStore";
import {
  FitbitClient,
  getAccessToken,
  getRefreshToken,
} from "@/external/fitbit";
import { trackersQueryKeys } from "@/localDB/routers/tracker";
import { View, Text } from "react-native";
import { range } from "@/lib/utils";
import { startOfWeek } from "date-fns";
import { getDatesBetween, getDateStr } from "@/lib/dateTime";

export const FitbitCustomTrackers = () => {
  const today = new Date();
  const thisSunday = startOfWeek(today, { weekStartsOn: 0 });
  const datesPassedThisWeek = getDatesBetween(thisSunday, today);
  const datesPassedThisWeekStr = datesPassedThisWeek.map(getDateStr);
  const remainingDays = 7 - datesPassedThisWeek.length;
  const clientId = getSecureConfigSync("oauth.fitbit.clientId");
  const clientSecret = getSecureConfigSync("oauth.fitbit.clientSecret");
  const refreshToken = getSecureConfigSync("oauth.fitbit.refreshToken");

  if (!clientId || !clientSecret || !refreshToken) return;

  return (
    <>
      <Text className="text-muted text-lg mt-2">Fitbit</Text>
      <View className="flex-row w-full justify-evenly items-center">
        <View className="w-24">
          <Text className="text-foreground text-lg py-1">Sleep</Text>
        </View>
        <View className="flex-grow">
          <View className="flex-row justify-around items-center">
            {datesPassedThisWeekStr.map((i) => (
              <View key={i}>
                <ScoreForDate
                  date={i}
                  clientId={clientId}
                  clientSecret={clientSecret}
                  refreshToken={refreshToken}
                />
              </View>
            ))}
            {range(0, remainingDays).map((i, index) => (
              <View key={index} className="h-1" style={{ width: 20 }} />
            ))}
          </View>
        </View>
      </View>
    </>
  );
};

const ScoreForDate = ({
  date,
}: {
  date: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}) => {
  const { data } = useQuery({
    queryKey: trackersQueryKeys.trackerScoreForDate(date, "external.fitbit"),
    queryFn: async () => {
      const fitbitClient = new FitbitClient();
      await fitbitClient.init();
      const data = JSON.stringify(await fitbitClient.getCustomSleepScore(date));
      return data;
    },
  });
  if (!data) return;

  const score = Math.round(Number(data));
  return (
    <View>
      <Text className="text-foreground">{score}</Text>
    </View>
  );
};
