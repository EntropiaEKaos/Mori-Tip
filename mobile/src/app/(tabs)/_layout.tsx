import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.line,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Feed", tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text> }} />
      <Tabs.Screen name="explore" options={{ title: "Explorar", tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔍</Text> }} />
      <Tabs.Screen name="roteiros" options={{ title: "Roteiros", tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🗺️</Text> }} />
      <Tabs.Screen name="pousadas" options={{ title: "Pousadas", tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏨</Text> }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text> }} />
    </Tabs>
  );
}
