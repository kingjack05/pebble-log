import { Pressable, Text, TextInput, View } from "react-native";
import { createStore } from "@xstate/store";
import { bulletTypes } from "@/localDB/schema";
import type { Bullet } from "@/localDB/schema";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "@xstate/store/react";
import {
  addBulletToCollection,
  updateBulletType,
} from "@/localDB/routers/bullets";
import { cn } from "@/lib/utils";
import {
  EventIcon,
  GratitudeIcon,
  NoteIcon,
  NullIcon,
  TaskDoneIcon,
  TaskOpenIcon,
  UndefinedIcon,
  WinIcon,
} from "./Bullet/icons";

type BulletType = (typeof bulletTypes)[number];
const draftBulletTypeStore = createStore({
  context: {
    isEditingBullet: false,
    draftData: null as
      | { draftType: "create" }
      | { draftType: "edit"; bulletId: number }
      | null,
    type: "null" as BulletType,
  },
  on: {
    initBulletEditing: (
      context,
      { bulletId, initType }: { bulletId: number; initType: BulletType }
    ) => ({
      isEditingBullet: true,
      draftData: { draftType: "edit", bulletId } as const,
      type: initType,
    }),
    endBulletEditing: (context) => ({ isEditingBullet: false }),
    initBulletCreating: (context, { initType }: { initType: BulletType }) => ({
      isEditingBullet: true,
      draftData: { draftType: "create" } as const,
      type: initType,
    }),
    endBulletCreating: (context) => ({ isEditingBullet: false }),
    setType: (context, event: { newType: BulletType }) => ({
      type: event.newType,
    }),
  },
});

export function Bullet({
  id,
  initText,
  initType,
}: {
  id: number;
  initText: string;
  initType: Bullet["type"];
}) {
  const [type, setType] = useState(initType);
  const draftType = useSelector(
    draftBulletTypeStore,
    (state) => state.context.type
  );
  const [isFocused, setIsFocused] = useState(false);
  const IconComponent = BulletTypeToIcon[type];

  useEffect(() => {
    if (isFocused) {
      setType(draftType);
    }
  }, [isFocused, draftType]);

  return (
    <View className="flex flex-row items-center">
      <IconComponent width={14} height={14} className="text-foreground mr-2" />
      <TextInput
        className="text-foreground text-lg flex-1"
        defaultValue={initText}
        onFocus={() => {
          setIsFocused(true);
          draftBulletTypeStore.send({
            type: "initBulletEditing",
            bulletId: id,
            initType: type,
          });
        }}
        onBlur={() => {
          // unsure if this can lead to a race condition, ie: if focus gets transefered to another Bullet and onBlur gets triggered after onFocus
          setIsFocused(false);
          draftBulletTypeStore.send({ type: "endBulletEditing" });
        }}
      />
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
  const [isFocused, setIsFocused] = useState(false);
  const draftType = useSelector(
    draftBulletTypeStore,
    (state) => state.context.type
  );
  const IconComponent = BulletTypeToIcon[type];

  useEffect(() => {
    if (isFocused) {
      setType(draftType);
    }
  }, [isFocused, draftType]);

  const addBulletM = addBulletToCollection(text, type, order, collectionId);

  return (
    <View className="flex flex-row items-center">
      <IconComponent width={14} height={14} className="text-foreground mr-2" />
      <TextInput
        className="text-foreground text-lg flex-1"
        value={text}
        onChangeText={setText}
        onEndEditing={() => {
          addBulletM.mutateAsync().then(() => {
            setText("");
            afterBulletCreatedCB();
          });
        }}
        onFocus={() => {
          setIsFocused(true);
          draftBulletTypeStore.send({
            type: "initBulletCreating",
            initType: type,
          });
        }}
        onBlur={() => {
          setIsFocused(false);
          draftBulletTypeStore.send({ type: "endBulletCreating" });
        }}
        placeholder="New bullet"
        placeholderTextColor="hsl(0, 0%, 40%)"
      />
    </View>
  );
}

export function BulletTypeEditorKeyboardToolbar() {
  const { isEditingBullet, draftData, type } = useSelector(
    draftBulletTypeStore,
    ({ context }) => context
  );
  const updateBulletTypeM = updateBulletType();

  if (!isEditingBullet || !draftData) {
    return null;
  }

  return (
    <View className="flex flex-row border-t border-muted justify-center items-center">
      <View className="flex-1 flex flex-row">
        {bulletTypes.map((val) => {
          const IconComponent = BulletTypeToIcon[val];
          if (val === "null") {
            return;
          }
          return (
            <Pressable
              key={val}
              style={{ padding: 12, paddingHorizontal: 9 }}
              onPress={() => {
                if (draftData.draftType === "edit") {
                  const bulletId = draftData.bulletId;
                  updateBulletTypeM.mutate(
                    { bulletId, type: val },
                    {
                      onSuccess: () => {
                        draftBulletTypeStore.send({
                          type: "setType",
                          newType: val,
                        });
                      },
                    }
                  );
                } else if (draftData.draftType === "create") {
                  draftBulletTypeStore.send({
                    type: "setType",
                    newType: val,
                  });
                }
              }}
            >
              <IconComponent
                width={20}
                height={20}
                className={cn(type === val ? "text-foreground" : "text-muted")}
              />
            </Pressable>
          );
        })}
      </View>
      <Pressable
        className="flex-none"
        onPress={() => {
          if (draftData.draftType === "edit") {
            const bulletId = draftData.bulletId;
            updateBulletTypeM.mutate(
              { bulletId, type: "null" },
              {
                onSuccess: () => {
                  draftBulletTypeStore.send({
                    type: "setType",
                    newType: "null",
                  });
                },
              }
            );
          } else if (draftData.draftType === "create") {
            draftBulletTypeStore.send({
              type: "setType",
              newType: "null",
            });
          }
        }}
      >
        <Text className="text-muted text-sm">set to null</Text>
      </Pressable>
    </View>
  );
}

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
