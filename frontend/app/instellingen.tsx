import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Switch, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { useAuth } from "@/src/auth/AuthContext";
import { PlusModal } from "@/src/components/PlusModal";
import { APP_NAME, APP_PLUS_NAME } from "@/src/config/branding";
import { BRAND } from "@/src/theme/tokens";

export default function Settings() {
  const { palette, colorScheme, toggleTheme } = useTheme() as any;
  const { state, user, signIn, signOut } = useAuth();
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = React.useState(false);
  const [showPlus, setShowPlus] = React.useState(false);

  const handleSignIn = async () => { setLoadingAuth(true); try { await signIn(); } finally { setLoadingAuth(false); } };
  const handleSignOut = async () => { setLoadingAuth(true); try { await signOut(); } finally { setLoadingAuth(false); } };

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
        {/* Profiel sectie */}
        <Section title="Profiel" palette={palette}>
          <RowLink icon="user" label="Mijn profiel" sub={`Hoe meer ${APP_NAME} weet, hoe scherper het gesprek`}
            onPress={() => router.push("/instellingen/profiel" as any)} palette={palette} testID="settings-profiel" />
        </Section>

        {/* Account sectie */}
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
                  <Text style={[styles.rowLabel, { color: palette.textPrimary }]} numberOfLines={1}>{user.name}</Text>
                  <Text style={[styles.rowValue, { color: palette.textMuted }]} numberOfLines={1}>{user.email}</Text>
                </View>
                <View style={[styles.planBadge, { backgroundColor: BRAND.blueAlpha08, borderColor: BRAND.blueAlpha25 }]}>
                  <Text style={[styles.planBadgeText, { color: BRAND.blue }]}>Gratis</Text>
                </View>
              </View>
              <TouchableOpacity testID="settings-signout" onPress={handleSignOut} disabled={loadingAuth}
                style={[styles.actionRow, { borderBottomColor: palette.borderSubtle, opacity: loadingAuth ? 0.5 : 1 }]}>
                <Feather name="log-out" size={16} color="#EF4444" />
                <Text style={[styles.rowLabel, { color: "#EF4444", marginLeft: 10 }]}>Uitloggen</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.row, { borderBottomColor: palette.borderSubtle }]}>
                <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Anoniem</Text>
                <Text style={[styles.rowValue, { color: palette.textMuted }]}>Geen profiel</Text>
              </View>
              <TouchableOpacity testID="settings-signin" onPress={handleSignIn} disabled={loadingAuth}
                style={[styles.actionRow, { borderBottomColor: palette.borderSubtle, opacity: loadingAuth ? 0.5 : 1 }]}>
                {loadingAuth ? <ActivityIndicator size="small" color={palette.accent} /> : <Feather name="log-in" size={16} color={BRAND.blue} />}
                <Text style={[styles.rowLabel, { color: palette.textPrimary, marginLeft: 10, flex: 1 }]}>Aanmelden met Google</Text>
                <Feather name="chevron-right" size={16} color={palette.textMuted} />
              </TouchableOpacity>
              <View style={styles.hintRow}>
                <Text style={[styles.hintText, { color: palette.textMuted }]}>Optioneel — voor sync en Plus tier</Text>
              </View>
            </>
          )}
        </Section>

        {/* Abonnement */}
        <Section title="Abonnement" palette={palette}>
          <View style={[styles.row, { borderBottomColor: palette.borderSubtle }]}>
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Huidig plan</Text>
            <View style={[styles.planBadge, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
              <Text style={[styles.planBadgeText, { color: palette.textPrimary }]}>Gratis</Text>
            </View>
          </View>
          <TouchableOpacity testID="settings-upgrade" onPress={() => setShowPlus(true)} activeOpacity={0.75}
            style={[styles.actionRow, { borderBottomColor: "transparent" }]}>
            <View style={[styles.zapCircle, { backgroundColor: BRAND.blueAlpha08 }]}>
              <Feather name="zap" size={14} color={BRAND.blue} />
            </View>
            <Text style={[styles.rowLabel, { color: palette.textPrimary, marginLeft: 10, flex: 1 }]}>Probeer {APP_PLUS_NAME}</Text>
            <View style={[styles.plusBadge, { backgroundColor: BRAND.blue }]}>
              <Text style={styles.plusBadgeText}>PLUS</Text>
            </View>
          </TouchableOpacity>
        </Section>

        {/* Gemeenschap */}
        <Section title="Gemeenschap" palette={palette}>
          <RowLink icon="users" label="Anonieme community" sub="Lees mee in thema-kanalen. Posten met Plus."
            onPress={() => router.push("/community" as any)} palette={palette} testID="settings-community" />
        </Section>

        {/* Uiterlijk */}
        <Section title="Uiterlijk" palette={palette}>
          <View style={[styles.row, { borderBottomColor: palette.borderSubtle }]}>
            <View style={styles.rowLeft}>
              <Feather name="moon" size={16} color={palette.textPrimary} />
              <Text style={[styles.rowLabel, { color: palette.textPrimary, marginLeft: 10 }]}>Dark mode</Text>
            </View>
            <Switch
              value={colorScheme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: "#E5E7EB", true: BRAND.blue }}
              thumbColor={Platform.OS === 'android' ? "#ffffff" : undefined}
            />
          </View>
        </Section>

        {/* Over */}
        <Section title="Over" palette={palette}>
          <View style={[styles.row, { borderBottomColor: palette.borderSubtle }]}>
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Versie</Text>
            <Text style={[styles.rowValue, { color: palette.textMuted }]}>1.0.0</Text>
          </View>
          <View style={[styles.row, { borderBottomColor: "transparent" }]}>
            <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Taal</Text>
            <Text style={[styles.rowValue, { color: palette.textMuted }]}>Belgisch Nederlands</Text>
          </View>
        </Section>
      </ScrollView>

      <View style={[styles.disclaimerBar, { borderTopColor: palette.borderSubtle, backgroundColor: palette.background }]}>
        <Text style={[styles.disclaimerText, { color: palette.textMuted }]}>{APP_NAME} is geen vervanging voor professionele zorg.</Text>
      </View>

      <PlusModal visible={showPlus} reason="generic" onClose={() => setShowPlus(false)} />
    </SafeAreaView>
  );
}

function RowLink({ icon, label, sub, onPress, palette, testID }: any) {
  return (
    <TouchableOpacity testID={testID} onPress={onPress} style={[s2.row, { borderBottomColor: palette.borderSubtle }]} activeOpacity={0.7}>
      <Feather name={icon} size={16} color={palette.textPrimary} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[s2.label, { color: palette.textPrimary }]}>{label}</Text>
        {sub && <Text style={[s2.sub, { color: palette.textMuted }]}>{sub}</Text>}
      </View>
      <Feather name="chevron-right" size={16} color={palette.textMuted} />
    </TouchableOpacity>
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

const s2 = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 0.5 },
  label: { fontSize: 14.5 },
  sub: { fontSize: 12.5, marginTop: 2 },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { height: 48, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 0.5 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 15, fontWeight: "500" },
  body: { padding: 16, paddingBottom: 80 },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 11, fontWeight: "500", letterSpacing: 0.5, paddingHorizontal: 4, marginBottom: 8 },
  sectionBox: { borderRadius: 14, borderWidth: 0.5, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 0.5 },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  profileRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 0.5 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  actionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 0.5 },
  hintRow: { paddingHorizontal: 14, paddingVertical: 8 },
  hintText: { fontSize: 11.5, lineHeight: 16 },
  rowLabel: { fontSize: 14.5 },
  rowValue: { fontSize: 13.5 },
  planBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 0.5 },
  planBadgeText: { fontSize: 12, fontWeight: "500" },
  zapCircle: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  plusBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5 },
  plusBadgeText: { color: "#ffffff", fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
  disclaimerBar: { paddingHorizontal: 18, paddingVertical: 10, borderTopWidth: 0.5 },
  disclaimerText: { fontSize: 10.5, textAlign: "center", lineHeight: 14 },
});
