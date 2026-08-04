import { View, Text, ScrollView, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { colors, radius, typography } from "../../theme";
import { GoldButton } from "../../components/GoldButton";
import { api } from "../../services/api";

const PACKAGES = [
  { id: "m1", label: "Mochileiro", moris: 250, price: 19.9, bonus: 0 },
  { id: "m2", label: "Explorador", moris: 600, price: 39.9, bonus: 50 },
  { id: "m3", label: "Anfitrião", moris: 1500, price: 89.9, bonus: 200 },
  { id: "m4", label: "VIP", moris: 4000, price: 199.9, bonus: 800 },
];

export default function WalletScreen() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    api.get("/api/wallet").then(setData).catch(() => {});
  }, []);

  async function buy(pkg: typeof PACKAGES[number]) {
    try {
      const r = await api.post("/api/payments/checkout", { amountBrl: pkg.price, morisAmount: pkg.moris + pkg.bonus });
      if (r.initPoint) {
        const { Linking } = require("react-native");
        await Linking.openURL(r.initPoint);
      }
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ivory }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ backgroundColor: colors.black, padding: 24, borderRadius: radius.xl }}>
        <Text style={{ color: colors.gold, fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>CARTEIRA MORI</Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
          <View style={{ flex: 1, backgroundColor: "#1a1815", padding: 16, borderRadius: radius.lg }}>
            <Text style={{ color: colors.gold, fontSize: 10, fontWeight: "800" }}>MORIS</Text>
            <Text style={{ color: colors.ivory, fontSize: 28, fontWeight: "800" }}>{data?.wallet?.moris ?? 0}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#1a1815", padding: 16, borderRadius: radius.lg }}>
            <Text style={{ color: colors.gold, fontSize: 10, fontWeight: "800" }}>CRÉDITOS</Text>
            <Text style={{ color: colors.ivory, fontSize: 28, fontWeight: "800" }}>{data?.wallet?.credits ?? 0}</Text>
          </View>
        </View>
      </View>
      <Text style={{ ...typography.h2 }}>Comprar Moris</Text>
      {PACKAGES.map((p) => (
        <View key={p.id} style={{ backgroundColor: colors.white, padding: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "800", fontSize: 16 }}>{p.label}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{p.moris + p.bonus} Moris {p.bonus > 0 && <Text style={{ color: colors.gold }}>+{p.bonus}</Text>}</Text>
          </View>
          <GoldButton title={`R$ ${p.price.toFixed(2)}`} onPress={() => buy(p)} />
        </View>
      ))}
    </ScrollView>
  );
}
