import { drizzle } from "drizzle-orm/op-sqlite";
import { open } from "@op-engineering/op-sqlite";
import * as FileSystem from "expo-file-system";
import { getBackupConfigs } from "@/lib/secureStore";
import { getFileInfo, uploadFile } from "@/lib/s3";

const opsqlite = open({
  name: "myDB",
});

export async function syncDBFile() {
  const filePath = `file://${opsqlite.getDbPath()}`;
  const dbFileInfo = await FileSystem.getInfoAsync(filePath, { md5: true });
  if (!dbFileInfo.exists) throw new Error("Failed to read db file");

  const localLastModified = dbFileInfo.modificationTime;

  const { endpoint, region, bucket, keyID, key } = await getBackupConfigs();
  if (!endpoint || !region || !bucket || !keyID || !key)
    throw new Error("Missing credentials for s3 backup");

  const remoteFileInfo = await getFileInfo({
    localUrl: filePath,
    endpoint,
    region,
    bucket,
    keyID,
    key,
  });

  if (!remoteFileInfo.exists) {
    await uploadFile({
      localUrl: filePath,
      endpoint,
      region,
      bucket,
      keyID,
      key,
    });
  } else if (remoteFileInfo.exists) {
    const remoteLastModified = remoteFileInfo.lastModified.getUTCSeconds();

    if (remoteLastModified < localLastModified) {
      await uploadFile({
        localUrl: filePath,
        endpoint,
        region,
        bucket,
        keyID,
        key,
      });
    } else if (remoteLastModified > localLastModified) {
      console.log("Need to download remote");
    }
  }
}

export const db = drizzle(opsqlite);
