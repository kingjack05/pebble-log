import React from "react";
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureChangeEventPayload,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";

type DraggableProps = {
  onStartDrag?: (
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>
  ) => void;
  onDrag?: (
    event: GestureUpdateEvent<
      PanGestureHandlerEventPayload & PanGestureChangeEventPayload
    >
  ) => void;
  onEndDrag?: (
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
    success: boolean
  ) => void;
  children: React.ReactNode;
};

export function Draggable({
  onStartDrag = () => {},
  onDrag = () => {},
  onEndDrag = () => {},
  children,
}: DraggableProps) {
  const drag = Gesture.Pan()
    .onStart(onStartDrag)
    .onChange(onDrag)
    .onEnd(onEndDrag)
    .runOnJS(true);

  return <GestureDetector gesture={drag}>{children}</GestureDetector>;
}
