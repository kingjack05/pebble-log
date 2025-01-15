import { useState } from "react";
import { View, Text, TextInput } from "react-native";

export default function Collections() {
  const [items, setItems] = useState<string[]>([]);
  const [text, setText] = useState("");
  return (
    <View>
      {items.map((i, index) => (
        <Text
          // className="text-foreground"
          style={{ color: "white" }}
          key={index}
        >
          {i}
        </Text>
      ))}
      <TextInput
        style={{ color: "white" }}
        // className="text-foreground"
        value={text}
        onChangeText={(val) => {
          setText(val);
        }}
        onEndEditing={() => {
          setItems((prev) => [...prev, text]);
          setText("");
        }}
        placeholder="New bullet"
        placeholderTextColor="hsl(0, 0%, 40%)"
      />
      <Text className="text-foreground">Collections</Text>
    </View>
  );
}
