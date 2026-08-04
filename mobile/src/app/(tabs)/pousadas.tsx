import { View, Text, FlatList, Image, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { colors, radius } from "../../theme";
import { Link } from "expo-router";

export default function PousadasScreen() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.get("/api/inns").then(setItems).catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 16, color: colors.black }}>Pousadas</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/inn/[id]", params: { id: String(item.id) } }} as any>
            <View style={{ backgroundColor: colors.white, borderRadius: radius.lg, marginBottom: 12, borderWidth: 1, borderColor: colors.line, overflow: "hidden" }}>
              {item.coverUrl ? (
                <Image source={{ uri: item.coverUrl }} style={{ width: "100%", height: 140 }} />
              ) : (
                <View style={{ width: "100%", height: 140, backgroundColor: colors.black, justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: colors.gold, fontSize: 36, fontWeight: "800" }}>M</Text>
                </View>
              )}
              <View style={{ padding: 14 }}>
                <Text style={{ fontWeight: "800", fontSize: 16 }}>{item.name}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{item.city}, {item.state}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: colors.black }}>R$ {item.pricePerNight}</Text>
                  <Text style={{ color: colors.muted, fontSize: 11 }}>/noite</Text>
                </View>
              </View>
            </View>
          </Link>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: colors.muted, marginTop: 32 }}>Sem pousadas.</Text>}
      />
    </View>
  );
}
