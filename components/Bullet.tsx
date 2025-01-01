import { Pressable, Text, TextInput, View } from "react-native";
import Svg, { Path, SvgProps, Circle } from "react-native-svg";
import { cssInterop } from "nativewind";

import type { Bullet } from "@/localDB/schema";
import React, { useState } from "react";
import { addBulletToCollection } from "@/localDB/routers/bullets";

function BulletTypePicker({ type }: { type: Bullet["type"] }) {
  const IconComponent = BulletTypeToIcon[type];
  return (
    <View>
      <Pressable
        onPress={() => {
          console.log("Pressed", Math.random());
        }}
        style={{ padding: 8 }}
      >
        {IconComponent({
          width: 20,
          height: 20,
          className: "text-foreground",
        })}
      </Pressable>
    </View>
  );
}

export function Bullet({
  id,
  text,
  type,
}: {
  id: number;
  text: string;
  type: Bullet["type"];
}) {
  const IconComponent = BulletTypeToIcon[type];
  return (
    <View className="flex flex-row">
      {IconComponent({ width: 12, className: "text-foreground" })}
      <TextInput className="ml-2 text-foreground" defaultValue={text} />
    </View>
  );
}

export function NewBullet({
  order,
  collectionId,
  afterBulletCreatedCB,
}: {
  order: number;
  collectionId: number;
  afterBulletCreatedCB: Function;
}) {
  const [text, setText] = useState("");
  const [type, setType] =
    useState<Parameters<typeof addBulletToCollection>[1]>("undefined");
  const addBulletM = addBulletToCollection(text, type, order, collectionId);

  return (
    <View className="flex flex-row">
      <BulletTypePicker type={type} />
      <TextInput
        className="border-b border-solid border-gray-600 w-20 text-foreground placeholder:text-muted ml-2"
        value={text}
        onChangeText={setText}
        onEndEditing={() => {
          addBulletM.mutateAsync().then(() => {
            setText("");
            afterBulletCreatedCB();
          });
        }}
        placeholder="New bullet"
      />
    </View>
  );
}

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

const TaskOpenIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    {...props}
  >
    <Circle cx={12} cy={12} r={10} />
  </Svg>
);
const TaskDoneIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    {...props}
  >
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <Path d="M22 4 12 14.01l-3-3" />
  </Svg>
);
const EventIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    {...props}
  >
    <Circle cx={12} cy={12} r={10} />
    <Circle cx={12} cy={12} r={3} />
  </Svg>
);
const NoteIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="feather feather-minus"
    {...props}
  >
    <Path d="M5 12h14" />
  </Svg>
);
const GratitudeIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    {...props}
  >
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);
const WinIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    {...props}
  >
    <Path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);
const UndefinedIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeDasharray="1,3"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    {...props}
  >
    <Circle cx={12} cy={12} r={10} />
  </Svg>
);
const NullIcon = (props: SvgProps) => {
  return null;
};
const BulletTypeToIcon = {
  "task.open": TaskOpenIcon,
  "task.done": TaskDoneIcon,
  event: EventIcon,
  note: NoteIcon,
  gratitude: GratitudeIcon,
  win: WinIcon,
  undefined: UndefinedIcon,
  null: NullIcon,
} as const;
