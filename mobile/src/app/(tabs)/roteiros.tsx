import { View, Text, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { colors, radius } from "../../theme";
import { Link } from "expo-router";

export default function RoteirosScreen() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.get("/api/itineraries").then(setItems).catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 16, color: colors.black }}>Roteiros</Text>
      <FlatList
        data={items}
        keyExtractor={(it: any) => String(it.id)}
        renderItem={({ item }: any) => (
          <Link href={{ pathname: "/itinerary/[id]", params: { id: String(item.id) } } as never}>
            <View style={{ backgroundColor: colors.white, padding: 16, borderRadius: radius.lg, marginBottom: 10, borderWidth: 1, borderColor: colors.line }}>
              <Text style={{ fontWeight: "800", fontSize: 16 }}>{item.title}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{item.city} · {item.days} dias · R$ {item.budget}</Text>
            </View>
          </Link>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: colors.muted, marginTop: 32 }}>Sem roteiros.</Text>}
      />
    </View>
  );
}
