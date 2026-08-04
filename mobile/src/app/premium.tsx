import { View, Text, ScrollView } from "react-native";
import { colors, radius, typography } from "../../theme";
import { GoldButton } from "../../components/GoldButton";
import { Crown } from "lucide-react-native";
import { api } from "../../services/api";
import { useState } from "react";
import { Alert } from "react-native";

export default function PremiumScreen() {
  const [busy, setBusy] = useState(false);
  async function subscribe() {
    setBusy(true);
    try {
      await api.post("/api/premium", {});
      Alert.alert("Premium ativo", "Bem-vindo ao Mori Premium!");
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally { setBusy(false); }
  }
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ivory }} contentContainerStyle={{ padding: 24, gap: 16 }}>
      <View style={{ backgroundColor: colors.black, padding: 32, borderRadius: radius.xl, alignItems: "center" }}>
        <Crown size={48} color={colors.gold} />
        <Text style={{ color: colors.gold, fontSize: 28, fontWeight: "800", marginTop: 12 }}>Mori Premium</Text>
        <Text style={{ color: colors.muted, marginTop: 4 }}>500 Moris / 30 dias</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 12 }}>+200 Moris de bônus na assinatura</Text>
      </View>
      <View style={{ backgroundColor: colors.white, padding: 20, borderRadius: radius.lg, gap: 12, borderWidth: 1, borderColor: colors.line }}>
        {["Reservas em pousadas parceiras", "Badge Premium exclusiva", "Pousadas do host liberam reservas", "Suporte prioritário"].map((b) => (
          <Text key={b} style={{ fontSize: 14, color: colors.black }}>✓ {b}</Text>
        ))}
      </View>
      <GoldButton title={busy ? "Ativando..." : "Assinar agora"} onPress={subscribe} loading={busy} fullWidth />
    </ScrollView>
  );
}
