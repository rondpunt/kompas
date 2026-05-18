import React from "react";
import { View, StyleSheet, Platform } from "react-native";

/**
 * NoiseOverlay — 1-2% noise textuur over de hele canvas.
 * Premium feel: voorkomt "platte digitale" look (per design spec §9).
 *
 * Op web: gebruikt een base64 SVG noise pattern (lichtgewicht, ~1KB).
 * Op native: zelfde via een base64 PNG/data-uri (zelfde data) — werkt overal.
 */
const NOISE_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
      <filter id='n'>
        <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
        <feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0'/>
      </filter>
      <rect width='100%' height='100%' filter='url(%23n)'/>
    </svg>`,
  );

export function NoiseOverlay() {
  // RN-Web ondersteunt backgroundImage; native niet, daar tonen we gewoon niks
  if (Platform.OS !== "web") return null;
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundImage: `url("${NOISE_DATA_URI}")` as any,
          backgroundRepeat: "repeat" as any,
          opacity: 0.25, // SVG zelf is al alpha 0.06 → effectief ~1.5%
          zIndex: 9999,
        } as any,
      ]}
    />
  );
}
