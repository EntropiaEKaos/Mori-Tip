import React from "react";
import Svg, { Circle, Polygon, Text } from "react-native-svg";

export function CompassLogo({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx="32" cy="32" r="30" stroke="#c5a84a" strokeWidth={2.5} />
      <Circle cx="32" cy="32" r="26" stroke="#c5a84a" strokeWidth={1} strokeDasharray="3 3" />
      <Polygon points="32,8 34.5,24 31.5,24" fill="#c5a84a" />
      <Polygon points="56,32 40,34.5 40,31.5" fill="#c5a84a" />
      <Polygon points="8,32 24,29.5 24,34.5" fill="#0f0f11" />
      <Polygon points="32,56 30.5,40 33.5,40" fill="#0f0f11" stroke="#c5a84a" strokeWidth={0.8} />
      <Circle cx="32" cy="32" r="3.5" fill="#0f0f11" stroke="#c5a84a" strokeWidth={1.2} />
      <Text x="32" y="5" textAnchor="middle" fontSize="3.5" fill="#c5a84a" fontWeight="bold">N</Text>
      <Text x="59" y="33" textAnchor="middle" fontSize="3.5" fill="#c5a84a" fontWeight="bold">E</Text>
      <Text x="5" y="33" textAnchor="middle" fontSize="3.5" fill="#0f0f11" fontWeight="bold">O</Text>
      <Text x="32" y="62" textAnchor="middle" fontSize="3.5" fill="#0f0f11" fontWeight="bold">S</Text>
    </Svg>
  );
}
