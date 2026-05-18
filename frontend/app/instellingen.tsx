import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { useAuth } from "@/src/auth/AuthContext";
import { PlusModal } from "@/src/components/PlusModal";
import { APP_NAME, APP_PLUS_NAME } from "@/src/config/branding";

const THEME_OPTIONS: { id: string; label: string }[] = [
  { id: "night", label: "Dark" },
];

export default function Settings() {
  const { palette } = useTheme();
  const { state, user, signIn, signOut } = useAuth();
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = React.useState(false);
  const [showPlus, setShowPlus] = React.useState(false);

  const handleSignIn = async () => {
    setLoadingAuth(true);
    try {
      await signIn();
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    setLoadingAuth(true);
    try {
      await signOut();
    } finally {
      setLoadingAuth(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}>
        <TouchableOpacity testID="settings-back" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: palette.textPrimary }]}>Instellingen</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} testID="settings-body">
        {/* Profile section */}
        <Section title="Profiel" palette={palette}>
          <TouchableOpacity
            testID="settings-profiel"
            onPress={() => router.push("/instellingen/profiel" as any)}
            style={[styles.actionRow, { borderBottomColor: palette.borderSubtle }]}
          >
            <Feather name="user" size={16} color={palette.textPrimary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Mijn profiel</Text>
              <Text style={[styles.rowValue, { color: palette.textMuted }]}>
                Hoe meer {APP_NAME} weet, hoe scherper het gesprek
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={palette.textMuted} />
          </TouchableOpacity>
        </Section>

        {/* Account section */}
        <Section title="Account" palette={palette}>
          {state.status === "loading" ? (
            <View style={[styles.row, { borderBottomColor: palette.borderSubtle }]}>
              <ActivityIndicator size="small" color={palette.accent} />
            </View>
          ) : user ? (
            <>
              <View style={[styles.profileRow, { borderBottomColor: palette.borderSubtle }]} testID="settings-profile">
                {user.picture ? (
                  <Image source={{ uri: user.picture }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: palette.surfaceHigher, alignItems: "center", justifyContent: "center" }]}>
                    <Feather name="user" size={18} color={palette.textMuted} />
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.rowLabel, { color: palette.textPrimary }]} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={[styles.rowValue, { color: palette.textMuted }]} numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                testID="settings-signout"
                onPress={handleSignOut}
                disabled={loadingAuth}
                style={[styles.actionRow, { borderBottomColor: palette.borderSubtle, opacity: loadingAuth ? 0.5 : 1 }]}
              >
                <Feather name="log-out" size={16} color={palette.textPrimary} />
                <Text style={[styles.rowLabel, { color: palette.textPrimary, marginLeft: 10 }]}>Uitloggen</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.row, { borderBottomColor: palette.borderSubtle }]}>
                <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Anoniem</Text>
                <Text style={[styles.rowValue, { color: palette.textMuted }]}>Geen profiel</Text>
              </View>
              <TouchableOpacity
                testID="settings-signin"
                onPress={handleSignIn}
                disabled={loadingAuth}
                style={[styles.actionRow, { borderBottomColor: palette.borderSubtle, opacity: loadingAuth ? 0.5 : 1 }]}
              >
                {loadingAuth ? (
                  <ActivityIndicator size="small" color={palette.accent} />
                ) : (
                  <Feather name="log-in" size={16} color={palette.accent} />
                )}
                <Text style={[styles.rowLabel, { color: palette.textPrimary, marginLeft: 10, flex: 1 }]}>
                  Aanmelden met Google
                </Text>
                <Feather name="chevron-right" size={16} color={palette.textMuted} />
              </TouchableOpacity>
              <View style={[styles.hintRow]}>
                <Text style={[styles.hintText, { color: palette.textMuted }]}>
                  Optioneel — voor sync tussen toestellen en Plus tier
                </Text>
              </View>
            </>
          )}
        </Section>

        {/* Subscription section */}
        <Section title="Abonnement" palette={palette}>
          <View style={[styles.row, { borderBottomColor: palette.borderSubtle }]}>
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Huidige plan</Text>
            <View style={[styles.tierPill, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
              <Text style={[styles.tierPillText, { color: palette.textPrimary }]}>Gratis</Text>
            </View>
          </View>
          <TouchableOpacity
            testID="settings-upgrade"
            onPress={() => setShowPlus(true)}
            activeOpacity={0.75}
            style={[styles.upgradeBtn, { borderColor: palette.borderDefault }]}
          >
            <Feather name="zap" size={14} color={palette.accent} />
            <Text style={[styles.upgradeBtnText, { color: palette.textPrimary }]}>
              Probeer {APP_PLUS_NAME}
            </Text>
            <View style={[styles.plusBadge, { backgroundColor: palette.accent }]}>
              <Text style={styles.plusBadgeText}>PLUS</Text>
            </View>
          </TouchableOpacity>
        </Section>

        {/* Community section */}
        <Section title="Gemeenschap" palette={palette}>
          <TouchableOpacity
            testID="settings-community"
            onPress={() => router.push("/community" as any)}
            style={[styles.actionRow, { borderBottomColor: palette.borderSubtle }]}
            activeOpacity={0.7}
          >
            <Feather name="users" size={16} color={palette.textPrimary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Anonieme community</Text>
              <Text style={[styles.rowValue, { color: palette.textMuted }]}>
                Lees mee in thema-kanalen. Posten met Plus.
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={palette.textMuted} />
          </TouchableOpacity>
        </Section>

        {/* Appearance section */}
        <Section title="Uiterlijk" palette={palette}>
          <View style={[styles.row, { borderBottomColor: palette.borderSubtle }]}>
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Thema</Text>
            <View style={[styles.themePill, { backgroundColor: palette.accentSoft }]}>
              <View style={[styles.themeDot, { backgroundColor: palette.accent }]} />
              <Text style={[styles.themePillText, { color: palette.textPrimary }]}>Light</Text>
            </View>
          </View>
        </Section>

        {/* Language section */}
        <Section title="Taal" palette={palette}>
          <View style={[styles.row, { borderBottomColor: palette.borderSubtle }]}>
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Taal</Text>
            <Text style={[styles.rowValue, { color: palette.textMuted }]}>Belgisch Nederlands</Text>
          </View>
        </Section>

        {/* About section */}
        <Section title="Over" palette={palette}>
          <View style={[styles.row, { borderBottomColor: palette.borderSubtle }]}>
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Versie</Text>
            <Text style={[styles.rowValue, { color: palette.textMuted }]}>1.0.0</Text>
          </View>
          <View style={[styles.row, { borderBottomColor: palette.borderSubtle }]}>
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Bron-inspiratie</Text>
            <Text style={[styles.rowValue, { color: palette.textMuted }]}>Borderline Times</Text>
          </View>
        </Section>
      </ScrollView>

      <View style={[styles.disclaimerBar, { borderTopColor: palette.borderSubtle, backgroundColor: palette.background }]}>
        <Text style={[styles.disclaimerText, { color: palette.textMuted }]}>
          {APP_NAME} is geen vervanging voor professionele zorg.
        </Text>
      </View>

      <PlusModal visible={showPlus} reason="generic" onClose={() => setShowPlus(false)} />
    </SafeAreaView>
  );
}

function Section({ title, children, palette }: any) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: palette.textMuted }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionBox, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    height: 48,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  body: {
    padding: 16,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  sectionBox: {
    borderRadius: 14,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
  },
  hintRow: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  hintText: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
  },
  rowLabel: {
    fontSize: 14.5,
  },
  rowValue: {
    fontSize: 13.5,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 0.5,
  },
  tierPillText: {
    fontSize: 12,
    fontWeight: "500",
  },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderTopWidth: 0.5,
    borderTopColor: "transparent",
    paddingHorizontal: 14,
    gap: 10,
  },
  upgradeBtnText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "500",
  },
  plusBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  plusBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  themePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  themeDot: { width: 6, height: 6, borderRadius: 3 },
  themePillText: { fontSize: 12, fontWeight: "600" },
  disclaimerBar: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderTopWidth: 0.5,
  },
  disclaimerText: {
    fontSize: 10.5,
    textAlign: "center",
    lineHeight: 14,
  },
});
