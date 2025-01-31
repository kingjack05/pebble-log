import * as SecureStore from "expo-secure-store";

// backup related settings: https://github.com/remotely-save/remotely-save/blob/34db181af002f8d71ea0a87e7965abc57b294914/docs/remote_services/s3_backblaze_b2/README.md
const SecureConfigKey = [
  "backup.s3.endpoint",
  "backup.s3.region",
  "backup.s3.bucket",
  "backup.s3.keyID",
  "backup.s3.key",
] as const;

export async function setSecureConfig<
  K extends (typeof SecureConfigKey)[number]
>(key: K, value: string) {
  await SecureStore.setItemAsync(key, value);
}

async function getSecureConfig<K extends (typeof SecureConfigKey)[number]>(
  key: K
): Promise<string | null> {
  return await SecureStore.getItemAsync(key);
}

export async function getBackupConfigs() {
  return {
    endpoint: await getSecureConfig("backup.s3.endpoint"),
    region: await getSecureConfig("backup.s3.region"),
    bucket: await getSecureConfig("backup.s3.bucket"),
    keyID: await getSecureConfig("backup.s3.keyID"),
    key: await getSecureConfig("backup.s3.key"),
  };
}
