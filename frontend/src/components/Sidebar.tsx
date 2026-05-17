import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { api, ApiConversation } from "@/src/api/client";
import { Wordmark } from "./Wordmark";

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

  const groups: Record<string, ApiConversation[]> = {
    "Vandaag": [],
    "Gisteren": [],
    "Afgelopen 7 dagen": [],
    "Afgelopen 30 dagen": [],
    "Ouder": [],
  };
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

export function Sidebar({ visible, onClose, currentConversationId, onSelectConversation }: Props) {
  const { palette } = useTheme();
  const router = useRouter();
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api.listConversations();
      setConversations(data);
    } catch (e) {
      console.warn("Failed to load conversations", e);
    }
  }, []);

  useEffect(() => {
    if (visible) load();
  }, [visible, load]);

  const filtered = conversations.filter((c) =>
    !search ? true : c.title.toLowerCase().includes(search.toLowerCase()),
  );
  const groups = groupByDate(filtered);

  const handleNew = () => {
    onSelectConversation(null);
    onClose();
  };

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    onClose();
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteConversation(id);
      if (currentConversationId === id) onSelectConversation(null);
      load();
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.panel,
            { backgroundColor: palette.background, borderRightColor: palette.borderDefault },
          ]}
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
              onPress={handleNew}
              style={[styles.newBtn, { borderColor: palette.borderDefault }]}
            >
              <Feather name="plus" size={16} color={palette.textPrimary} />
              <Text style={[styles.newBtnText, { color: palette.textPrimary }]}>Nieuw gesprek</Text>
            </TouchableOpacity>

            <View style={[styles.searchWrap, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
              <Feather name="search" size={14} color={palette.textMuted} />
              <TextInput
                testID="sidebar-search"
                placeholder="Zoeken"
                placeholderTextColor={palette.textMuted}
                value={search}
                onChangeText={setSearch}
                style={[styles.searchInput, { color: palette.textPrimary }]}
              />
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
                          onPress={() => handleSelect(c.id)}
                          onLongPress={() => handleDelete(c.id)}
                          style={[
                            styles.convoRow,
                            isActive && { backgroundColor: palette.surfaceElevated },
                          ]}
                        >
                          <Text
                            style={[styles.convoTitle, { color: isActive ? palette.textPrimary : palette.textSecondary }]}
                            numberOfLines={1}
                          >
                            {c.title || "Nieuw gesprek"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ),
              )}
            </ScrollView>

            <View style={[styles.bottomLinks, { borderTopColor: palette.borderSubtle }]}>
              <TouchableOpacity
                testID="sidebar-link-profiel"
                onPress={() => {
                  onClose();
                  router.push("/instellingen/profiel" as any);
                }}
                style={styles.linkRow}
              >
                <View style={styles.linkRowInner}>
                  <Feather name="user" size={16} color={palette.textPrimary} />
                  <Text style={[styles.linkText, { color: palette.textPrimary }]}>Profiel</Text>
                </View>
                <Feather name="chevron-right" size={16} color={palette.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                testID="sidebar-link-zelftesten"
                onPress={() => {
                  onClose();
                  router.push("/zelftesten");
                }}
                style={styles.linkRow}
              >
                <View style={styles.linkRowInner}>
                  <Feather name="check-square" size={16} color={palette.textPrimary} />
                  <Text style={[styles.linkText, { color: palette.textPrimary }]}>Zelftesten</Text>
                </View>
                <Feather name="chevron-right" size={16} color={palette.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                testID="sidebar-link-community"
                onPress={() => {
                  onClose();
                  router.push("/community");
                }}
                style={styles.linkRow}
              >
                <View style={styles.linkRowInner}>
                  <Feather name="users" size={16} color={palette.textPrimary} />
                  <Text style={[styles.linkText, { color: palette.textPrimary }]}>Gemeenschap</Text>
                  <View style={[styles.plusChip, { backgroundColor: palette.accent }]}>
                    <Text style={styles.plusChipText}>PLUS</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={16} color={palette.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                testID="sidebar-link-instellingen"
                onPress={() => {
                  onClose();
                  router.push("/instellingen");
                }}
                style={styles.linkRow}
              >
                <View style={styles.linkRowInner}>
                  <Feather name="settings" size={16} color={palette.textPrimary} />
                  <Text style={[styles.linkText, { color: palette.textPrimary }]}>Instellingen</Text>
                </View>
                <Feather name="chevron-right" size={16} color={palette.textMuted} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.scrim} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  panel: {
    width: "82%",
    maxWidth: 340,
    borderRightWidth: 0.5,
  },
  scrim: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBtn: {
    padding: 6,
  },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 0.5,
  },
  newBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 10,
    height: 38,
    borderRadius: 13,
    borderWidth: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  list: {
    flex: 1,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  group: {
    marginBottom: 14,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  convoRow: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  convoTitle: {
    fontSize: 14,
  },
  bottomLinks: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 0.5,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  linkRowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "500",
  },
  plusChip: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  plusChipText: {
    color: "#0a0a0a",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
