import React from "react";
import { Pressable, Text, ViewStyle, ActivityIndicator } from "react-native";
import { colors, radius, spacing } from "../theme";

interface GoldButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "gold" | "black" | "outline";
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function GoldButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "gold",
  style,
  fullWidth,
}: GoldButtonProps) {
  const bg = variant === "gold" ? colors.gold : variant === "black" ? colors.black : "transparent";
  const color = variant === "gold" ? colors.black : variant === "black" ? colors.gold : colors.goldDeep;
  const borderColor = variant === "outline" ? colors.gold : "transparent";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderRadius: radius.md,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          width: fullWidth ? "100%" : undefined,
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={{ color, fontWeight: "800", fontSize: 15 }}>{title}</Text>
      )}
    </Pressable>
  );
}
