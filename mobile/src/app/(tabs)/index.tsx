import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Image } from "react-native";
import { useRouter, Link } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { colors, radius, spacing, typography } from "../../theme";

type Post = {
  id: number;
  content: string;
  imageUrl: string | null;
  authorDisplayName: string;
  authorUsername: string;
  authorAvatar: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
};

export default function FeedScreen() {
  const router = useRouter();
  const { me, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!me) { router.replace("/(auth)/login"); return; }
    api.get("/api/posts").then(setPosts).finally(() => setLoading(false));
  }, [me, authLoading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.ivory }}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ivory }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Pressable onPress={() => router.push("/concierge")} style={{ backgroundColor: colors.black, padding: 16, borderRadius: radius.lg, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text style={{ fontSize: 24 }}>🧭</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.gold, fontWeight: "800", fontSize: 14 }}>Mori Concierge</Text>
          <Text style={{ color: colors.muted, fontSize: 11 }}>Assistente IA de viagens</Text>
        </View>
        <Text style={{ color: colors.gold, fontWeight: "700", fontSize: 18 }}>→</Text>
      </Pressable>

      {posts.length === 0 ? (
        <Text style={{ textAlign: "center", color: colors.muted, padding: 32 }}>Nenhum post ainda.</Text>
      ) : (
        posts.map((p) => (
          <View key={p.id} style={{ backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line, gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gold }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", fontSize: 14 }}>{p.authorDisplayName}</Text>
                <Text style={{ color: colors.muted, fontSize: 11 }}>@{p.authorUsername}</Text>
              </View>
            </View>
            {p.imageUrl && <Image source={{ uri: p.imageUrl }} style={{ width: "100%", height: 200, borderRadius: radius.md }} />}
            {p.content && <Text style={{ fontSize: 14, lineHeight: 20 }}>{p.content}</Text>}
            <View style={{ flexDirection: "row", gap: 16 }}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>❤️ {p.likeCount}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>💬 {p.commentCount}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
