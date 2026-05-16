import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Share, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CrisisSheet({ visible, onClose }: Props) {
  const { palette } = useTheme();
  if (!visible) return null;

  const dialNumber = (num: string) => {
    const url = Platform.OS === "ios" ? `telprompt:${num}` : `tel:${num}`;
    Linking.openURL(url).catch(() => {});
  };

  const openTeleOnthaal = () => {
    Linking.openURL("https://www.tele-onthaal.be").catch(() => {});
  };

  const shareCrisisMessage = async () => {
    try {
      await Share.share({
        message: "Ik heb het moeilijk en wou je dit vragen — ben je bereikbaar?",
      });
    } catch {}
  };

  return (
    <View style={[styles.backdrop]} testID="crisis-sheet">
      <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderDefault }]}>
        <View style={[styles.handle, { backgroundColor: palette.borderEmphasis }]} />
        <View style={[styles.banner, { backgroundColor: palette.dangerBg }]}>
          <Text style={[styles.bannerText, { color: palette.danger }]}>Hulp nu</Text>
        </View>
        <Text style={[styles.body, { color: palette.textPrimary }]}>
          Je hebt iets gedeeld waar het moeilijk over praten over is. Mensen die getraind zijn om te luisteren zijn nu bereikbaar.
        </Text>

        <TouchableOpacity
          testID="crisis-call-1813"
          onPress={() => dialNumber("1813")}
          style={[styles.primaryBtn, { backgroundColor: palette.danger }]}
        >
          <Feather name="phone" size={16} color="#ffffff" />
          <Text style={styles.primaryBtnText}>Bel 1813 — Zelfmoordlijn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="crisis-call-1712"
          onPress={() => dialNumber("1712")}
          style={[styles.secondaryBtn, { borderColor: palette.borderDefault }]}
        >
          <Feather name="phone" size={16} color={palette.textPrimary} />
          <Text style={[styles.secondaryBtnText, { color: palette.textPrimary }]}>Bel 1712 — Geweld, misbruik</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="crisis-tele-onthaal"
          onPress={openTeleOnthaal}
          style={[styles.secondaryBtn, { borderColor: palette.borderDefault }]}
        >
          <Feather name="message-circle" size={16} color={palette.textPrimary} />
          <Text style={[styles.secondaryBtnText, { color: palette.textPrimary }]}>Chat met Tele-Onthaal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="crisis-share"
          onPress={shareCrisisMessage}
          style={[styles.secondaryBtn, { borderColor: palette.borderDefault }]}
        >
          <Feather name="share-2" size={16} color={palette.textPrimary} />
          <Text style={[styles.secondaryBtnText, { color: palette.textPrimary }]}>Stuur bericht naar vertrouwde persoon</Text>
        </TouchableOpacity>

        <TouchableOpacity testID="crisis-close" onPress={onClose} style={styles.ghostBtn}>
          <Text style={[styles.ghostBtnText, { color: palette.textMuted }]}>Sluiten</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  backdropTouch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: "500",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: 13,
    marginBottom: 10,
    gap: 8,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 13,
    borderWidth: 0.5,
    marginBottom: 10,
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  ghostBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  ghostBtnText: {
    fontSize: 14,
  },
});
