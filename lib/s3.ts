import * as Crypto from "expo-crypto";
if (typeof global.crypto !== "object") {
  //@ts-expect-error
  global.crypto = {};
}

if (typeof global.crypto.getRandomValues !== "function") {
  // manual polyfill with expo-crypto, since the polyfill suggested by amazon ["react-native-get-random-values"](https://github.com/aws/aws-sdk-js-v3?tab=readme-ov-file#getting-started) doesn't yet support new architecture
  // maybe after this is merged, it won't be needed https://github.com/LinusU/react-native-get-random-values/pull/59
  //@ts-expect-error
  global.crypto.getRandomValues = Crypto.getRandomValues;
}

import "react-native-url-polyfill/auto";
import "web-streams-polyfill/dist/polyfill";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { File } from "expo-file-system/next";

export async function getFileInfo({
  localUrl,
  endpoint,
  region,
  bucket,
  keyID,
  key,
}: {
  localUrl: string;
  endpoint: string;
  region: string;
  bucket: string;
  keyID: string;
  key: string;
}) {
  const s3 = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: keyID,
      secretAccessKey: key,
    },
  });
  const file = new File(localUrl);
  if (!file.exists) throw new Error("Incorrect file url");
  const fileName = file.name;

  try {
    const response = await s3.send(
      new HeadObjectCommand({ Bucket: bucket, Key: fileName })
    );
    const lastModified = response.LastModified!;
    return { exists: true, lastModified } as const;
  } catch (error: any) {
    if (error.name === "NotFound") {
      return { exists: false } as const;
    }
    console.error(error);
    throw error;
  }
}

export async function uploadFile({
  localUrl,
  endpoint,
  region,
  bucket,
  keyID,
  key,
}: {
  localUrl: string;
  endpoint: string;
  region: string;
  bucket: string;
  keyID: string;
  key: string;
}) {
  const s3 = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: keyID,
      secretAccessKey: key,
    },
  });
  const file = new File(localUrl);
  if (!file.exists) throw new Error("Incorrect file url");
  const fileName = file.name;
  console.log(fileName);
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: bucket,
      Key: fileName,
      Body: file.readableStream(),
    },
  });

  upload.on("httpUploadProgress", (progress) => {
    console.log(`Uploaded ${progress.loaded} bytes`);
  });

  try {
    const data = await upload.done();
    console.log("File uploaded successfully:", data);
  } catch (err) {
    console.error("Upload failed:", err);
  }
}
