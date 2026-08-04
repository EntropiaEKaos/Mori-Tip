import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors, radius, typography } from "../theme";
import { api } from "../services/api";
import { useState } from "react";

export default function SettingsScreen() {
  const { me, logout, refresh } = useAuth();
  const [lang, setLang] = useState<"pt" | "en" | "es">("pt");
  if (!me) return null;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ivory }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ ...typography.h2 }}>Configurações</Text>

      <View style={{ backgroundColor: colors.white, padding: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line }}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>Idioma</Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {(["pt", "en", "es"] as const).map((l) => (
            <Pressable
              key={l}
              onPress={() => setLang(l)}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: lang === l ? colors.black : colors.ivory, borderWidth: 1, borderColor: colors.line }}
            >
              <Text style={{ color: lang === l ? colors.gold : colors.muted, fontWeight: "800", fontSize: 12 }}>
                {l.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ backgroundColor: colors.white, padding: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line }}>
        <Text style={{ fontWeight: "700", marginBottom: 4 }}>Conta</Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{me.displayName} · @{me.username}</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{me.moris} Moris · {me.credits} créditos</Text>
      </View>

      <Pressable
        onPress={async () => { await logout(); }}
        style={{ padding: 16, backgroundColor: colors.black, borderRadius: radius.md, alignItems: "center" }}
      >
        <Text style={{ color: colors.gold, fontWeight: "700" }}>Sair da conta</Text>
      </Pressable>
    </ScrollView>
  );
}
