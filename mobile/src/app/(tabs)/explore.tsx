import { View, Text, TextInput, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { colors, radius } from "../../theme";

export default function ExploreScreen() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    const t = setTimeout(async () => {
      try { setUsers(await api.get(`/api/users?q=${q}`)); } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory, padding: 16, gap: 12 }}>
      <TextInput
        placeholder="Buscar viajantes..."
        placeholderTextColor={colors.muted}
        value={q}
        onChangeText={setQ}
        style={{ backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, fontSize: 14, borderWidth: 1, borderColor: colors.line }}
      />
      <FlatList
        data={users}
        keyExtractor={(u) => String(u.id)}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: colors.white, padding: 12, borderRadius: radius.lg, marginBottom: 8, borderWidth: 1, borderColor: colors.line, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gold }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", fontSize: 14 }}>{item.displayName}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>@{item.username}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: colors.muted, marginTop: 32 }}>Nenhum viajante encontrado.</Text>}
      />
    </View>
  );
}
