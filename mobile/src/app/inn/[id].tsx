import { use, useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { api } from "../../services/api";
import { colors, radius, typography } from "../../theme";
import { GoldButton } from "../../components/GoldButton";

export default function InnDetailScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [inn, setInn] = useState<any>(null);
  useEffect(() => {
    api.get(`/api/inns/${id}`).then(setInn).catch(() => {});
  }, [id]);
  if (!inn) return <ActivityIndicator color={colors.gold} style={{ flex: 1 }} />;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ivory }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ backgroundColor: colors.black, height: 200, borderRadius: radius.lg, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.gold, fontSize: 64, fontWeight: "800" }}>M</Text>
      </View>
      <View style={{ backgroundColor: colors.white, padding: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line }}>
        <Text style={{ ...typography.h1 }}>{inn.name}</Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>{inn.city}, {inn.state}</Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 8, gap: 4 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.black }}>R$ {inn.pricePerNight}</Text>
          <Text style={{ color: colors.muted }}>/noite</Text>
        </View>
        <Text style={{ marginTop: 12, color: colors.black, lineHeight: 20 }}>{inn.description}</Text>
      </View>
      <GoldButton title="Reservar estadia" onPress={() => alert("Sistema de reservas no app web")} fullWidth />
    </ScrollView>
  );
}
