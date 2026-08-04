import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../services/api";
import { colors, radius, typography } from "../../theme";
import { GoldButton } from "../../components/GoldButton";
import { CompassLogo } from "../../components/CompassLogo";

type Msg = { id: string; from: "ai" | "user"; text: string; inns?: any[]; guides?: any[]; itineraries?: any[] };

export default function ConciergeScreen() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { id: "w", from: "ai", text: "Olá! Sou o Mori Concierge 🧭. Onde você quer viajar?" },
  ]);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!prompt.trim() || busy) return;
    const userText = prompt;
    setPrompt("");
    setMessages((m) => [...m, { id: String(Date.now()), from: "user", text: userText }]);
    setBusy(true);
    try {
      const d = await api.post("/api/ai/concierge", { prompt: userText });
      setMessages((m) => [
        ...m,
        { id: String(Date.now() + 1), from: "ai", text: d.message, inns: d.inns, guides: d.guides, itineraries: d.itineraries },
      ]);
    } catch {
      setMessages((m) => [...m, { id: String(Date.now() + 1), from: "ai", text: "Erro de comunicação. Tente novamente." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory }}>
      <View style={{ padding: 16, backgroundColor: colors.black, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <CompassLogo size={28} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.gold, fontWeight: "800" }}>Mori Concierge</Text>
          <Text style={{ color: colors.muted, fontSize: 11 }}>Assistente IA</Text>
        </View>
        <Pressable onPress={() => router.back()}><Text style={{ color: colors.gold, fontSize: 24 }}>×</Text></Pressable>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ gap: 12 }}>
        {messages.map((m) => (
          <View key={m.id} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "85%", backgroundColor: m.from === "user" ? colors.black : colors.white, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line }}>
            <Text style={{ color: m.from === "user" ? colors.gold : colors.black, fontSize: 14, lineHeight: 20 }}>{m.text}</Text>
            {m.from === "ai" && m.inns && m.inns.length > 0 && (
              <View style={{ marginTop: 8, gap: 6 }}>
                {m.inns.slice(0, 3).map((i) => (
                  <View key={i.id} style={{ backgroundColor: colors.ivory, padding: 8, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line }}>
                    <Text style={{ fontWeight: "700", fontSize: 12 }}>{i.name}</Text>
                    <Text style={{ color: colors.muted, fontSize: 10 }}>{i.city} · R$ {i.pricePerNight}/noite</Text>
                  </View>
                ))}
              </View>
            )}
            {m.from === "ai" && m.guides && m.guides.length > 0 && (
              <View style={{ marginTop: 8, gap: 6 }}>
                {m.guides.slice(0, 3).map((g) => (
                  <View key={g.id} style={{ backgroundColor: colors.ivory, padding: 8, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line }}>
                    <Text style={{ fontWeight: "700", fontSize: 12 }}>{g.headline}</Text>
                    <Text style={{ color: colors.muted, fontSize: 10 }}>{g.city} · R$ {g.pricePerDay}/dia</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
        {busy && <ActivityIndicator color={colors.gold} />}
      </ScrollView>

      <View style={{ padding: 12, flexDirection: "row", gap: 8, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line }}>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Onde vamos?"
          placeholderTextColor={colors.muted}
          style={{ flex: 1, backgroundColor: colors.ivory, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999, fontSize: 14, color: colors.black }}
        />
        <GoldButton title="Enviar" onPress={send} />
      </View>
    </View>
  );
}
