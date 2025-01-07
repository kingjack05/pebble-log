import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export function useKeyboard() {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setHeight(event.endCoordinates.height);
        setOpen(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setHeight(0);
        setOpen(false);
      }
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return { open, height };
}
