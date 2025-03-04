const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.kingjack05.pebblelog.dev";
  }
  if (IS_PREVIEW) {
    return "com.kingjack05.pebblelog.preview";
  }
  return "com.kingjack05.pebblelog";
};

const getAppName = () => {
  if (IS_DEV) {
    return "Pebble Log (Dev)";
  }
  if (IS_PREVIEW) {
    return "Pebble Log (Preview)";
  }
  return "Pebble Log";
};

export default {
  name: getAppName(),
  slug: "pebble-log",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "com.kingjack05.pebblelog",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: getUniqueIdentifier(),
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          image: "./assets/images/splash-icon.png",
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-secure-store",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "c526b164-2ad4-43df-9b99-a0ea19ea4e1f",
    },
  },
};
