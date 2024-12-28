// import { Tabs } from "expo-router";
// import Ionicons from "@expo/vector-icons/Ionicons";
// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: "#ffd33d",
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           headerShown: false,
//           title: "Today",
//           tabBarIcon: ({ color, focused }) => (
//             <Ionicons
//               name={focused ? "today" : "today-outline"}
//               color={color}
//               size={24}
//             />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { Text } from "react-native";
// Defining the layout of the custom tab navigator
export default function Layout() {
  return (
    <Tabs>
      <TabSlot />
      <TabList>
        <TabTrigger name="home" href="/">
          <Text>Home</Text>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
