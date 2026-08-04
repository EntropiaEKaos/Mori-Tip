import { use, useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { api } from "../../services/api";
import { colors, radius, typography } from "../../theme";

export default function ItineraryDetailScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [it, setIt] = useState<any>(null);
  useEffect(() => {
    api.get(`/api/itineraries/${id}`).then(setIt).catch(() => {});
  }, [id]);
  if (!it) return <ActivityIndicator color={colors.gold} style={{ flex: 1 }} />;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ivory }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ backgroundColor: colors.white, padding: 20, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line }}>
        <Text style={{ ...typography.h1 }}>{it.title}</Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{it.city}, {it.state} · {it.days} dias · R$ {it.budget}</Text>
        <Text style={{ marginTop: 12, lineHeight: 20 }}>{it.description}</Text>
      </View>
      {it.stops?.map((s: any, i: number) => (
        <View key={i} style={{ backgroundColor: colors.white, padding: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, flexDirection: "row", gap: 12 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.black, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: colors.gold, fontSize: 12, fontWeight: "800" }}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "800" }}>{s.title}</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>{s.description}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
