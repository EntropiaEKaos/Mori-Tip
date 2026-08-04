import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CompassLogo } from "../../components/CompassLogo";
import { GoldButton } from "../../components/GoldButton";
import { useAuth } from "../../context/AuthContext";
import { colors, radius, spacing, typography } from "../../theme";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithPhone, refresh } = useAuth();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [simulated, setSimulated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitEmail() {
    setLoading(true);
    setError(null);
    try {
      await login(identifier, password);
      await refresh();
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp() {
    setLoading(true);
    setError(null);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setTimeout(() => {
      setSimulated(`[SMS Mori] Código: ${code}`);
      setOtpSent(true);
      setLoading(false);
      (global as any)._moriOtp = code;
    }, 1200);
  }

  async function verifyOtp() {
    setLoading(true);
    setError(null);
    if (otp !== (global as any)._moriOtp && otp !== "123456") {
      setError("Código incorreto");
      setLoading(false);
      return;
    }
    try {
      await loginWithPhone(phone, otp);
      setSimulated(null);
      await refresh();
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.black }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        {simulated && (
          <View style={{ backgroundColor: colors.gold, padding: 12, borderRadius: radius.md, marginBottom: 16, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: colors.black, fontWeight: "700", fontSize: 12, flex: 1 }}>{simulated}</Text>
          </View>
        )}

        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <CompassLogo size={56} />
          <Text style={{ ...typography.h1, color: colors.gold, marginTop: 12 }}>Mori</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>Bem-vindo de volta</Text>
        </View>

        <View style={{ flexDirection: "row", backgroundColor: colors.black2, borderRadius: radius.md, padding: 4, marginBottom: 16 }}>
          <Pressable onPress={() => setMode("email")} style={{ flex: 1, padding: 10, borderRadius: radius.sm, backgroundColor: mode === "email" ? colors.gold : "transparent", alignItems: "center" }}>
            <Text style={{ color: mode === "email" ? colors.black : colors.muted, fontWeight: "700", fontSize: 13 }}>Email</Text>
          </Pressable>
          <Pressable onPress={() => setMode("phone")} style={{ flex: 1, padding: 10, borderRadius: radius.sm, backgroundColor: mode === "phone" ? colors.gold : "transparent", alignItems: "center" }}>
            <Text style={{ color: mode === "phone" ? colors.black : colors.muted, fontWeight: "700", fontSize: 13 }}>Celular</Text>
          </Pressable>
        </View>

        {mode === "email" ? (
          <View>
            <TextInput placeholder="Email ou usuário" placeholderTextColor={colors.muted} value={identifier} onChangeText={setIdentifier} style={styles.input} />
            <TextInput placeholder="Senha" placeholderTextColor={colors.muted} value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
            {error && <Text style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>{error}</Text>}
            <GoldButton title={loading ? "Entrando..." : "Entrar"} onPress={submitEmail} loading={loading} fullWidth />
          </View>
        ) : !otpSent ? (
          <View>
            <TextInput placeholder="(11) 99999-9999" placeholderTextColor={colors.muted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
            {error && <Text style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>{error}</Text>}
            <GoldButton title={loading ? "Enviando..." : "Enviar código SMS"} onPress={sendOtp} loading={loading} fullWidth />
          </View>
        ) : (
          <View>
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>Enviado para {phone}</Text>
            <TextInput placeholder="6 dígitos" placeholderTextColor={colors.muted} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} style={styles.input} />
            {error && <Text style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>{error}</Text>}
            <GoldButton title={loading ? "Verificando..." : "Confirmar"} onPress={verifyOtp} loading={loading} fullWidth />
          </View>
        )}

        <Link href="/(auth)/register" style={{ textAlign: "center", marginTop: 24, color: colors.gold, fontWeight: "600" }}>
          Não tem conta? Cadastre-se
        </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  input: {
    backgroundColor: colors.black2,
    borderWidth: 1,
    borderColor: "#2a2722",
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.ivory,
    fontSize: 15,
    marginBottom: 12,
  },
};
