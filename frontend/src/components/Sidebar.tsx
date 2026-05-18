import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, SafeAreaView, Platform, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { api, ApiConversation } from "@/src/api/client";
import { Wordmark } from "./Wordmark";
import { BRAND } from "@/src/theme/tokens";

interface Props {
  visible: boolean;
  onClose: () => void;
  currentConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
}

function groupByDate(items: ApiConversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const week = new Date(today.getTime() - 7 * 86400000);
  const month = new Date(today.getTime() - 30 * 86400000);
  const groups: Record<string, ApiConversation[]> = { "Vandaag": [], "Gisteren": [], "Afgelopen 7 dagen": [], "Afgelopen 30 dagen": [], "Ouder": [] };
  for (const c of items) {
    const d = new Date(c.updated_at);
    if (d >= today) groups["Vandaag"].push(c);
    else if (d >= yesterday) groups["Gisteren"].push(c);
    else if (d >= week) groups["Afgelopen 7 dagen"].push(c);
    else if (d >= month) groups["Afgelopen 30 dagen"].push(c);
    else groups["Ouder"].push(c);
  }
  return groups;
}

const NAV_LINKS = [
  { testID: "sidebar-link-profiel", icon: "user", label: "Profiel", route: "/instellingen/profiel" },
  { testID: "sidebar-link-zelftesten", icon: "check-square", label: "Zelftesten", route: "/zelftesten" },
  { testID: "sidebar-link-community", icon: "users", label: "Gemeenschap", route: "/community", plus: true },
  { testID: "sidebar-link-instellingen", icon: "settings", label: "Instellingen", route: "/instellingen" },
] as const;

export function Sidebar({ visible, onClose, currentConversationId, onSelectConversation }: Props) {
  const { palette } = useTheme();
  const router = useRouter();
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [search, setSearch] = useState("");
  const slideX = useRef(new Animated.Value(-340)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    try { setConversations(await api.listConversations()); } catch {}
  }, []);

  useEffect(() => {
    if (visible) {
      load();
      Animated.parallel([
        Animated.spring(slideX, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideX, { toValue: -340, duration: 220, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, load]);

  const filtered = conversations.filter((c) => !search ? true : c.title.toLowerCase().includes(search.toLowerCase()));
  const groups = groupByDate(filtered);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.panel, { backgroundColor: palette.background, borderRightColor: palette.borderDefault, transform: [{ translateX: slideX }] }]}
          testID="sidebar-panel"
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
              <Wordmark size={17} testID="sidebar-wordmark" />
              <TouchableOpacity onPress={onClose} testID="sidebar-close" style={styles.iconBtn}>
                <Feather name="x" size={20} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              testID="sidebar-new-chat"
              onPress={() => { onSelectConversation(null); onClose(); }}
              style={[styles.newBtn, { borderColor: palette.borderDefault, backgroundColor: palette.surfaceElevated }]}
            >
              <View style={[styles.newBtnIcon, { backgroundColor: palette.accent }]}>
                <Feather name="plus" size={13} color="#fff" />
              </View>
              <Text style={[styles.newBtnText, { color: palette.textPrimary }]}>Nieuw gesprek</Text>
            </TouchableOpacity>

            <View style={[styles.searchWrap, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
              <Feather name="search" size={14} color={palette.textMuted} />
              <TextInput
                testID="sidebar-search"
                placeholder="Zoeken..."
                placeholderTextColor={palette.textMuted}
                value={search}
                onChangeText={setSearch}
                style={[styles.searchInput, { color: palette.textPrimary },
                  Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : null]}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Feather name="x" size={14} color={palette.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {Object.entries(groups).map(([label, items]) =>
                items.length === 0 ? null : (
                  <View key={label} style={styles.group}>
                    <Text style={[styles.groupLabel, { color: palette.textMuted }]}>{label}</Text>
                    {items.map((c) => {
                      const isActive = c.id === currentConversationId;
                      return (
                        <TouchableOpacity
                          key={c.id}
                          testID={`sidebar-convo-${c.id}`}
                          onPress={() => { onSelectConversation(c.id); onClose(); }}
                          onLongPress={() => api.deleteConversation(c.id).then(load).catch(() => {})}
                          style={[styles.convoRow, isActive && { backgroundColor: palette.accentSoft }]}
                        >
                          <Feather name="message-circle" size={12} color={isActive ? palette.accent : palette.textMuted} />
                          <Text style={[styles.convoTitle, { color: isActive ? palette.textPrimary : palette.textSecondary }]} numberOfLines={1}>
                            {c.title || "Nieuw gesprek"}
                          </Text>
                          {isActive && <View style={[styles.activeDot, { backgroundColor: palette.accent }]} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )
              )}
              {conversations.length === 0 && (
                <View style={styles.emptyConvos}>
                  <Feather name="message-square" size={28} color={palette.textFaint} />
                  <Text style={[styles.emptyConvosText, { color: palette.textMuted }]}>Nog geen gesprekken</Text>
                </View>
              )}
            </ScrollView>

            <View style={[styles.bottomLinks, { borderTopColor: palette.borderSubtle }]}>
              {NAV_LINKS.map((link) => (
                <TouchableOpacity key={link.testID} testID={link.testID}
                  onPress={() => { onClose(); router.push(link.route as any); }}
                  style={styles.linkRow}
                >
                  <View style={styles.linkRowInner}>
                    <Feather name={link.icon as any} size={16} color={palette.textPrimary} />
                    <Text style={[styles.linkText, { color: palette.textPrimary }]}>{link.label}</Text>
                    {link.plus && (
                      <View style={[styles.plusChip, { backgroundColor: BRAND.blue }]}>
                        <Text style={styles.plusChipText}>PLUS</Text>
                      </View>
                    )}
                  </View>
                  <Feather name="chevron-right" size={16} color={palette.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        </Animated.View>
        <Animated.View style={[styles.scrimAnimated, { opacity: overlayOpacity }]}>
          <TouchableOpacity activeOpacity={1} onPress={onClose} style={StyleSheet.absoluteFillObject} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row" },
  panel: { width: "82%", maxWidth: 300, borderRightWidth: 0.5 },
  scrimAnimated: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)", zIndex: -1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  iconBtn: { padding: 6 },
  newBtn: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 12, height: 42, paddingHorizontal: 12, borderRadius: 12, borderWidth: 0.5, marginBottom: 2 },
  newBtnIcon: { width: 22, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  newBtnText: { fontSize: 14, fontWeight: "500" },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 12, marginTop: 8, paddingHorizontal: 10, height: 38, borderRadius: 12, borderWidth: 0.5 },
  searchInput: { flex: 1, fontSize: 13.5 },
  list: { flex: 1, marginTop: 10, paddingHorizontal: 8 },
  group: { marginBottom: 14, paddingHorizontal: 4 },
  groupLabel: { fontSize: 10.5, fontWeight: "600", letterSpacing: 0.6, textTransform: "uppercase", paddingHorizontal: 8, marginBottom: 4 },
  convoRow: { paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  convoTitle: { fontSize: 13.5, flex: 1 },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  emptyConvos: { alignItems: "center", paddingVertical: 32, gap: 10 },
  emptyConvosText: { fontSize: 13 },
  bottomLinks: { paddingVertical: 6, paddingHorizontal: 8, borderTopWidth: 0.5 },
  linkRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 11, paddingHorizontal: 8, borderRadius: 10 },
  linkRowInner: { flexDirection: "row", alignItems: "center", gap: 10 },
  linkText: { fontSize: 14, fontWeight: "500" },
  plusChip: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginLeft: 4 },
  plusChipText: { color: "#ffffff", fontSize: 8.5, fontWeight: "700", letterSpacing: 0.4 },
});
