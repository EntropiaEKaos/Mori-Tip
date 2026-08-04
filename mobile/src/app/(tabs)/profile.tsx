import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { colors, radius } from "../../theme";
import { useRouter } from "expo-router";
import { GoldButton } from "../../components/GoldButton";
import { api } from "../../services/api";

export default function ProfileScreen() {
  const { me, logout } = useAuth();
  const router = useRouter();
  if (!me) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ivory }} contentContainerStyle={{ padding: 24, alignItems: "center" }}>
      <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.gold, marginBottom: 16 }} />
      <Text style={{ fontSize: 22, fontWeight: "800", color: colors.black }}>{me.displayName}</Text>
      <Text style={{ color: colors.muted, marginTop: 4 }}>@{me.username} · Nível {me.level}</Text>

      <View style={{ flexDirection: "row", gap: 32, marginTop: 24 }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "800" }}>0</Text>
          <Text style={{ color: colors.muted, fontSize: 11 }}>Posts</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "800" }}>0</Text>
          <Text style={{ color: colors.muted, fontSize: 11 }}>Seguidores</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "800" }}>0</Text>
          <Text style={{ color: colors.muted, fontSize: 11 }}>Seguindo</Text>
        </View>
      </View>

      <View style={{ backgroundColor: colors.white, padding: 16, borderRadius: radius.lg, marginTop: 24, width: "100%", alignItems: "center", borderWidth: 1, borderColor: colors.line }}>
        <Text style={{ color: colors.gold, fontSize: 28, fontWeight: "800" }}>{me.moris}</Text>
        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>Moris · {me.credits} créditos</Text>
      </View>

      {!me.isPremium && (
        <View style={{ width: "100%", marginTop: 16 }}>
          <GoldButton title="Assinar Premium" onPress={() => router.push("/premium" as any)} fullWidth />
        </View>
      )}

      <View style={{ width: "100%", marginTop: 12, gap: 8 }}>
        <Pressable onPress={() => router.push("/concierge" as any)} style={{ padding: 14, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: "center" }}>
          <Text style={{ color: colors.black, fontWeight: "700" }}>🧭 Mori Concierge IA</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/wallet" as any)} style={{ padding: 14, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: "center" }}>
          <Text style={{ color: colors.black, fontWeight: "700" }}>💎 Carteira</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/settings" as any)} style={{ padding: 14, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: "center" }}>
          <Text style={{ color: colors.black, fontWeight: "700" }}>⚙️ Configurações</Text>
        </Pressable>
        <Pressable onPress={async () => { await logout(); router.replace("/(auth)/login"); }} style={{ padding: 14, backgroundColor: colors.black, borderRadius: radius.md, alignItems: "center" }}>
          <Text style={{ color: colors.gold, fontWeight: "700" }}>Sair</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
