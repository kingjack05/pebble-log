import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
} from "expo-router/ui";
import React, { Ref, forwardRef } from "react";
import { Text, View, Pressable } from "react-native";
import { useColorScheme } from "nativewind";
import Svg, { Path, SvgProps, Circle } from "react-native-svg";
import { cssInterop } from "nativewind";
import { StatusBar } from "expo-status-bar";
import { cn } from "@/lib/utils";
import { SafeAreaView } from "react-native-safe-area-context";

cssInterop(Svg, {
  className: {
    target: "style",
    nativeStyleToProp: {
      width: true,
      height: true,
      fill: true,
    },
  },
});

/**
 * Headless Tab Layout https://docs.expo.dev/router/advanced/custom-tabs/
 */
export default function Layout() {
  const { colorScheme } = useColorScheme();
  return (
    <>
      <Tabs>
        <SafeAreaView
          className={cn(
            "flex flex-1 bg-background text-foreground",
            colorScheme === "dark" && "dark"
          )}
        >
          <TabSlot />
        </SafeAreaView>
        <TabList asChild>
          <View
            className={cn(
              "bg-background text-foreground border-t border-muted px-2 pt-2 pb-1 flex",
              colorScheme === "dark" && "dark"
            )}
            style={{ justifyContent: "center" }}
          >
            <TabTrigger name="home" href="/" asChild>
              <TabItem
                icon={(isFocused) => (
                  <DailyLogIcon
                    className={cn("text-muted", isFocused && "text-foreground")}
                  />
                )}
              >
                Daily
              </TabItem>
            </TabTrigger>
            <TabTrigger name="collections" href="/(tabs)/collections" asChild>
              <TabItem
                icon={(isFocused) => (
                  <CollectionsIcon
                    className={cn("text-muted", isFocused && "text-foreground")}
                  />
                )}
              >
                Entries
              </TabItem>
            </TabTrigger>
            <TabTrigger name="reflections" href="/reflections" asChild>
              <TabItem
                icon={(isFocused) => (
                  <ReflectionsIcon
                    className={cn("text-muted", isFocused && "text-foreground")}
                  />
                )}
              >
                Reflections
              </TabItem>
            </TabTrigger>
            <TabTrigger name="others" href="/others" asChild>
              <TabItem
                icon={(isFocused) => (
                  <OthersIcon
                    className={cn("text-muted", isFocused && "text-foreground")}
                  />
                )}
              >
                Others
              </TabItem>
            </TabTrigger>
          </View>
        </TabList>
      </Tabs>
      <StatusBar style="auto" />
    </>
  );
}

/**
 * Icons from feather icons. https://feathericons.com
 *
 * Converted from svg with https://react-svgr.com/playground/?native=true&typescript=true
 */
const DailyLogIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 24 24"
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    {...props}
  >
    <Circle cx={12} cy={12} r={10} />
    <Path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
  </Svg>
);
const CollectionsIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 24 24"
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="feather feather-book-open"
    {...props}
  >
    <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </Svg>
);
const ReflectionsIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="feather feather-rewind"
    {...props}
  >
    <Path d="m11 19-9-7 9-7v14zM22 19l-9-7 9-7v14z" />
  </Svg>
);
const OthersIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="feather feather-menu"
    {...props}
  >
    <Path d="M3 12h18M3 6h18M3 18h18" />
  </Svg>
);

export type TabItemProps = TabTriggerSlotProps & {
  icon?: (isFocused: boolean) => React.JSX.Element;
};
const TabItem = forwardRef(
  (
    { icon, children, isFocused, className, ...props }: TabItemProps,
    ref: Ref<View>
  ) => {
    return (
      <Pressable ref={ref} {...props}>
        <View
          className={cn(
            className,
            "w-24 flex flex-col justify-center items-center",
            isFocused && "text-foreground"
          )}
        >
          {icon ? icon(!!isFocused) : null}
          <Text
            className={cn(
              className,
              isFocused ? "text-foreground" : "text-muted"
            )}
          >
            {children}
          </Text>
        </View>
      </Pressable>
    );
  }
);
