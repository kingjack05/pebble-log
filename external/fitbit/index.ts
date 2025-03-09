import { getDateStr } from "@/lib/dateTime";
import {
  getOAuthConfigs,
  getSecureConfigSync,
  setFitbitAccessToken,
} from "@/lib/secureStore";
import { format } from "date-fns";

const baseUri = "https://api.fitbit.com";

export async function getRefreshToken({
  code,
  codeVerifier,
  clientId,
  clientSecret,
  redirectUri,
}: {
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}) {
  const res = (await (
    await fetch(
      `${baseUri}/oauth2/token?client_id=${clientId}&grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}&code_verifier=${codeVerifier}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
  ).json()) as {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
    user_id: string;
  };

  return res;
}

export async function getAccessToken({
  clientId,
  clientSecret,
  refreshToken,
}: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}) {
  const res = (await (
    await fetch(
      `${baseUri}/oauth2/token?client_id=${clientId}&grant_type=refresh_token&refresh_token=${refreshToken}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
  ).json()) as {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
    user_id: string;
  };

  return res;
}

/**
 * See https://dev.fitbit.com/build/reference/web-api/explore for available data
 */
export class FitbitClient {
  userID = "";
  accessToken = "";

  async init() {
    const lastRefreshed = getSecureConfigSync(
      "oauth.fitbit.accessToken.lastRefreshed"
    );
    const needsRefresh =
      !lastRefreshed ||
      new Date().getTime() - new Date(lastRefreshed).getTime() > 60 * 1000;
    const {
      fitbit: { clientId, clientSecret, refreshToken },
    } = await getOAuthConfigs();
    if (needsRefresh) {
      if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("Fitbit oauth configs were not set");
      }
      const { access_token, user_id, refresh_token } = await getAccessToken({
        clientId,
        clientSecret,
        refreshToken,
      });
      setFitbitAccessToken({
        accessToken: access_token,
        refreshToken: refresh_token,
      });
      this.userID = user_id;
      this.accessToken = access_token;
    } else {
      const userID = getSecureConfigSync("oauth.fitbit.userID");
      const accessToken = getSecureConfigSync("oauth.fitbit.accessToken");
      if (!userID || !accessToken) {
        throw new Error("Please refresh fitbit oauth token");
      }
      this.userID = userID;
      this.accessToken = accessToken;
    }
  }

  /**
   * @param date yyyy-MM-dd
   *
   * See https://dev.fitbit.com/build/reference/web-api/sleep/get-sleep-log-by-date/
   */
  async getSleepData(date: string) {
    const res = (await (
      await fetch(
        `${baseUri}/1.2/user/${this.userID}/sleep/date/${date}.json`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )
    ).json()) as {
      sleep: { startTime: string; endTime: string }[];
      summary: {
        stages: { deep: number; light: number; rem: number; wake: number };
        totalMinutesAsleep: number;
        totalTimeInBed: number;
      };
    };

    return res;
  }
  /**
   *
   * See
   */
  async getHRData(date: string) {
    const res = await (
      await fetch(`${baseUri}/1/user/-/activities/heart/date/${date}/1d.json`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })
    ).json();

    return res;
  }
  /**
   *
   * See https://dev.fitbit.com/build/reference/web-api/intraday/get-heartrate-intraday-by-interval/
   */
  async getHRIntradayData(
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string,
    detailLevel = "15min"
  ) {
    const res = (await (
      await fetch(
        `${baseUri}/1/user/-/activities/heart/date/${startDate}/${endDate}/${detailLevel}/time/${startTime}/${endTime}.json`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )
    ).json()) as {
      "activities-heart": { value: number }[];
    };

    return res;
  }
  /**
   *
   * @param date
   */
  async getCustomSleepScore(date: string) {
    const sleepData = await this.getSleepData(date);

    const targetDeepsleepMins = 105;
    const deepSleepScore = Math.max(
      sleepData.summary.stages.deep / targetDeepsleepMins,
      1
    );
    const targetTotalSleepMins = 60 * 7;
    const totalSleepScore = Math.max(
      sleepData.summary.totalMinutesAsleep / targetTotalSleepMins,
      1
    );
    const sleepEffeciencyScore =
      sleepData.summary.totalMinutesAsleep / sleepData.summary.totalTimeInBed;

    const sleepHRDataPromises = sleepData.sleep.map((i) => {
      const start = new Date(i.startTime);
      const end = new Date(i.endTime);
      const startDate = getDateStr(start);
      const startTime = format(start, "HH:mm");
      const endDate = getDateStr(end);
      const endTime = format(end, "HH:mm");
      return this.getHRIntradayData(startDate, endDate, startTime, endTime);
    });
    const sleepHRData = await Promise.all(sleepHRDataPromises);
    const sleepRHR = sleepHRData.flatMap((i) =>
      i["activities-heart"].flatMap((i) => Number(i.value))
    );
    const sleepRHRScore =
      sleepRHR.reduce((prev, curr) => {
        return prev + 40 / curr;
      }, 0) / sleepRHR.length;

    return (
      ((deepSleepScore * 0.5 +
        totalSleepScore * 0.25 +
        sleepEffeciencyScore * 0.25 +
        sleepRHRScore) /
        2) *
      100
    );
  }
}
