import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { PlusModal } from "@/src/components/PlusModal";
import { communityApi, CommunityMe, CommunityPost } from "@/src/api/community";

interface Channel {
  id: string;
  label: string;
  hint: string;
  iconLib: "Feather" | "MaterialCommunityIcons";
  iconName: string;
  bgNight: string;
  fgNight: string;
}

const CHANNELS: Channel[] = [
  { id: "adhd", label: "ADHD", hint: "Concentratie, prikkels, ritme", iconLib: "Feather", iconName: "zap", bgNight: "#581c87", fgNight: "#d8b4fe" },
  { id: "autisme", label: "Autisme", hint: "Patronen, sociaal, prikkels", iconLib: "Feather", iconName: "layers", bgNight: "#134e4a", fgNight: "#5eead4" },
  { id: "burnout", label: "Burn-out", hint: "Werk, herstellen, grenzen", iconLib: "Feather", iconName: "battery", bgNight: "#7c2d12", fgNight: "#fdba74" },
  { id: "depressie", label: "Depressie", hint: "Donkere periodes, motivatie", iconLib: "Feather", iconName: "cloud-rain", bgNight: "#451a03", fgNight: "#fcd34d" },
  { id: "angst", label: "Angst", hint: "Piekeren, paniek, ademen", iconLib: "Feather", iconName: "wind", bgNight: "#1e3a8a", fgNight: "#93c5fd" },
  { id: "hsp", label: "Hooggevoelig", hint: "Prikkels, energie, rust", iconLib: "Feather", iconName: "feather", bgNight: "#831843", fgNight: "#f9a8d4" },
  { id: "verlies", label: "Verlies", hint: "Rouw, gemis, herinneren", iconLib: "MaterialCommunityIcons", iconName: "weather-cloudy", bgNight: "#1f2937", fgNight: "#d1d5db" },
  { id: "relaties", label: "Relaties", hint: "Partner, ouders, vrienden", iconLib: "Feather", iconName: "users", bgNight: "#1e40af", fgNight: "#bfdbfe" },
];

const FILTERS = [{ id: "all", label: "Alles" }, ...CHANNELS.map((c) => ({ id: c.id, label: c.label }))] as const;

function relTime(iso?: string) {
  if (!iso) return "net";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.max(1, Math.floor(ms / 60000));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}u`;
  return `${Math.floor(h / 24)}d`;
}

export default function Community() {
  const { palette } = useTheme();
  const router = useRouter();
  const [showPlus, setShowPlus] = useState(false);
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [me, setMe] = useState<CommunityMe | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postDraft, setPostDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [savingNick, setSavingNick] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [channelStats, setChannelStats] = useState<Record<string, { posts_count: number; last_post_at?: string }>>({});

  const load = useCallback(async () => {
    setErrorText(null);
    try {
      const [meRes, feedRes, statsRes] = await Promise.all([
        communityApi.me(),
        communityApi.feed(activeFilter === "all" ? "all" : activeFilter),
        communityApi.stats(),
      ]);
      setMe(meRes);
      setNicknameDraft(meRes.nickname ?? "");
      setPosts(feedRes);
      setChannelStats(statsRes.channels ?? {});
    } catch (e: any) {
      setErrorText(e?.message ?? "community laden mislukt");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const shownChannels = useMemo(() => {
    if (activeFilter === "all") return CHANNELS;
    return CHANNELS.filter((c) => c.id === activeFilter);
  }, [activeFilter]);

  const saveNickname = useCallback(async () => {
    const next = nicknameDraft.trim();
    if (next.length < 3 || savingNick) return;
    setSavingNick(true);
    try {
      const res = await communityApi.setNickname(next);
      setMe((prev) => (prev ? { ...prev, nickname: res.nickname } : prev));
    } catch (e: any) {
      setErrorText(e?.message ?? "nickname opslaan mislukt");
    } finally {
      setSavingNick(false);
    }
  }, [nicknameDraft, savingNick]);

  const submitPost = useCallback(async () => {
    if (!me?.can_post) {
      setShowPlus(true);
      return;
    }
    const content = postDraft.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      const created = await communityApi.createPost({
        content,
        channel: activeFilter === "all" ? "algemeen" : activeFilter,
      });
      setPosts((prev) => [created, ...prev]);
      const stats = await communityApi.stats();
      setChannelStats(stats.channels ?? {});
      setPostDraft("");
    } catch (e: any) {
      setErrorText(e?.message ?? "posten mislukt");
    } finally {
      setPosting(false);
    }
  }, [me?.can_post, postDraft, posting, activeFilter]);

  const startDM = useCallback(
    (nickname: string) => {
      if (!me?.can_dm) {
        setShowPlus(true);
        return;
      }
      router.push(`/community/${encodeURIComponent(nickname)}` as any);
    },
    [me?.can_dm, router],
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}>
        <TouchableOpacity testID="community-back" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: palette.textPrimary }]}>Gemeenschap</Text>
        <TouchableOpacity testID="community-open-inbox" onPress={() => router.push("/community/inbox" as any)} style={styles.iconBtn}>
          <Feather name="inbox" size={18} color={palette.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={[styles.heroCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}> 
          <View style={styles.heroGlow} />
          <View style={[styles.plusBadge, { backgroundColor: palette.accent }]}> 
            <Feather name="moon" size={10} color="#0a0a0a" />
            <Text style={styles.plusBadgeText}>BETA · READ-ONLY</Text>
          </View>
          <Text
            style={[
              styles.heroTitle,
              { color: palette.textPrimary, fontFamily: Platform.select({ ios: "Georgia", android: "serif" }) },
            ]}
          >
            Community die echt begrijpt{"\n"}wat je meemaakt
          </Text>
          <Text style={[styles.heroBody, { color: palette.textSecondary }]}>
            Warm en veilig in dark mode. Anonieme thema-kanalen, gemodereerd en rustig opgebouwd.
            Gratis gebruikers kunnen nu al meelezen in voorbeeldthreads.
          </Text>
          <View style={styles.heroFacts}>
            <View style={[styles.heroFactPill, { borderColor: palette.borderDefault }]}>
              <Feather name="shield" size={11} color={palette.textMuted} />
              <Text style={[styles.heroFactText, { color: palette.textMuted }]}>Anoniem</Text>
            </View>
            <View style={[styles.heroFactPill, { borderColor: palette.borderDefault }]}>
              <Feather name="eye-off" size={11} color={palette.textMuted} />
              <Text style={[styles.heroFactText, { color: palette.textMuted }]}>Geen profielen</Text>
            </View>
            <View style={[styles.heroFactPill, { borderColor: palette.borderDefault }]}>
              <Feather name="check-circle" size={11} color={palette.textMuted} />
              <Text style={[styles.heroFactText, { color: palette.textMuted }]}>Gemodereerd</Text>
            </View>
          </View>
          <TouchableOpacity
            testID="community-cta"
            onPress={() => setShowPlus(true)}
            style={[styles.heroCta, { backgroundColor: palette.accent }]}
          >
            <Text style={styles.heroCtaText}>Ontgrendel Plus Community</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.identityCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
          <Text style={[styles.identityLabel, { color: palette.textMuted }]}>ANONIEME NICKNAME</Text>
          <View style={styles.identityRow}>
            <TextInput
              testID="community-nickname-input"
              value={nicknameDraft}
              onChangeText={setNicknameDraft}
              placeholder="Jouw nickname"
              placeholderTextColor={palette.textFaint}
              style={[
                styles.identityInput,
                { color: palette.textPrimary, borderColor: palette.borderDefault, backgroundColor: palette.background },
              ]}
            />
            <TouchableOpacity
              testID="community-nickname-save"
              disabled={savingNick || nicknameDraft.trim().length < 3}
              onPress={saveNickname}
              style={[styles.identityBtn, { backgroundColor: palette.accent, opacity: savingNick ? 0.7 : 1 }]}
            >
              {savingNick ? <ActivityIndicator size="small" color="#0a0a0a" /> : <Text style={styles.identityBtnText}>Opslaan</Text>}
            </TouchableOpacity>
          </View>
          <Text style={[styles.identityHint, { color: palette.textMuted }]}>Je echte identiteit is nergens zichtbaar in de feed.</Text>
        </View>

        {me?.can_post ? (
          <View style={[styles.composeCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
            <Text style={[styles.composeTitle, { color: palette.textPrimary }]}>Deel anoniem wat er speelt</Text>
            <TextInput
              testID="community-post-input"
              value={postDraft}
              onChangeText={setPostDraft}
              multiline
              placeholder="Wat wil je delen met mensen die hetzelfde meemaken?"
              placeholderTextColor={palette.textFaint}
              style={[styles.composeInput, { color: palette.textPrimary, borderColor: palette.borderDefault }]}
            />
            <TouchableOpacity
              testID="community-post-submit"
              onPress={submitPost}
              disabled={posting || !postDraft.trim()}
              style={[styles.composeBtn, { backgroundColor: palette.accent, opacity: posting || !postDraft.trim() ? 0.65 : 1 }]}
            >
              {posting ? <ActivityIndicator size="small" color="#0a0a0a" /> : <Text style={styles.composeBtnText}>Plaats anoniem</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.lockedCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
            <Text style={[styles.lockedTitle, { color: palette.textPrimary }]}>Free = read-only</Text>
            <Text style={[styles.lockedBody, { color: palette.textSecondary }]}>Met Junie Plus kan je posten en direct contact leggen via DM.</Text>
            <TouchableOpacity testID="community-upsell-posting" onPress={() => setShowPlus(true)} style={[styles.lockedBtn, { borderColor: palette.borderDefault }]}>
              <Text style={[styles.lockedBtnText, { color: palette.textPrimary }]}>Ontgrendel posten + DM</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>FILTER</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = activeFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                testID={`community-filter-${f.id}`}
                onPress={() => setActiveFilter(f.id)}
                style={[
                  styles.filterPill,
                  {
                    borderColor: active ? palette.accent : palette.borderSubtle,
                    backgroundColor: active ? palette.accentSoft : palette.surfaceElevated,
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: active ? palette.textPrimary : palette.textMuted }]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>KANALEN</Text>

        <View style={styles.list}>
          {shownChannels.map((c) => (
            <TouchableOpacity
              key={c.id}
              testID={`community-channel-${c.id}`}
              onPress={() => setShowPlus(true)}
              style={[
                styles.card,
                { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle },
              ]}
            >
              <View style={[styles.cardIcon, { backgroundColor: c.bgNight }]}> 
                {c.iconLib === "Feather" ? (
                  <Feather name={c.iconName as any} size={18} color={c.fgNight} />
                ) : (
                  <MaterialCommunityIcons name={c.iconName as any} size={18} color={c.fgNight} />
                )}
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTopLine}>
                  <Text style={[styles.cardLabel, { color: palette.textPrimary }]}>{c.label}</Text>
                  <View style={[styles.lockChip, { borderColor: palette.borderEmphasis }]}>
                    <Feather name="lock" size={9} color={palette.textMuted} />
                    <Text style={[styles.lockChipText, { color: palette.textMuted }]}>Read-only</Text>
                  </View>
                </View>
                <Text style={[styles.cardHint, { color: palette.textMuted }]} numberOfLines={1}>
                  {c.hint}
                </Text>
                <View style={styles.cardMetaRow}>
                  <Text style={[styles.cardMetaText, { color: palette.textFaint }]}>
                    {(channelStats[c.id]?.posts_count ?? 0)} posts
                  </Text>
                  <View style={[styles.dot, { backgroundColor: palette.textFaint }]} />
                  <Text style={[styles.cardMetaText, { color: palette.textFaint }]}>
                    {channelStats[c.id]?.last_post_at ? `laatste ${relTime(channelStats[c.id]?.last_post_at)}` : "nog geen activiteit"}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color={palette.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>FEED</Text>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={palette.accent} />
          </View>
        ) : posts.length === 0 ? (
          <View style={[styles.emptyCard, { borderColor: palette.borderSubtle, backgroundColor: palette.surfaceElevated }]}>
            <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>Nog geen posts in dit kanaal</Text>
            <Text style={[styles.emptyBody, { color: palette.textMuted }]}>Jij kan als eerste delen zodra Plus actief is.</Text>
          </View>
        ) : (
          <View style={styles.feedList}>
            {posts.map((p) => (
              <View key={p.id} testID={`community-feed-post-${p.id}`} style={[styles.postCard, { borderColor: palette.borderSubtle, backgroundColor: palette.surfaceElevated }]}>
                <View style={styles.postHead}>
                  <Text style={[styles.postNick, { color: palette.textPrimary }]}>@{p.author_nickname}</Text>
                  <Text style={[styles.postMeta, { color: palette.textFaint }]}>
                    {p.channel} · {relTime(p.created_at)}
                  </Text>
                </View>
                <Text style={[styles.postBody, { color: palette.textSecondary }]}>{p.content}</Text>
                <View style={styles.postActions}>
                  <TouchableOpacity testID={`community-dm-${p.id}`} onPress={() => startDM(p.author_nickname)} style={[styles.dmBtn, { borderColor: palette.borderDefault }]}>
                    <Feather name="message-circle" size={13} color={palette.textPrimary} />
                    <Text style={[styles.dmBtnText, { color: palette.textPrimary }]}>Contact</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.guidelineCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.borderSubtle }]}>
          <Text style={[styles.guidelineTitle, { color: palette.textPrimary }]}>Communityregels</Text>
          <View style={styles.ruleRow}>
            <Feather name="check" size={14} color={palette.accent} />
            <Text style={[styles.ruleText, { color: palette.textSecondary }]}>Respectvol en zonder diagnoses opdringen</Text>
          </View>
          <View style={styles.ruleRow}>
            <Feather name="check" size={14} color={palette.accent} />
            <Text style={[styles.ruleText, { color: palette.textSecondary }]}>Geen persoonlijke identiteitsgegevens delen</Text>
          </View>
          <View style={styles.ruleRow}>
            <Feather name="check" size={14} color={palette.accent} />
            <Text style={[styles.ruleText, { color: palette.textSecondary }]}>Junie moderatie houdt het veilig en kalm</Text>
          </View>
          <TouchableOpacity testID="community-guidelines-cta" onPress={() => setShowPlus(true)} style={[styles.rulesCta, { borderColor: palette.borderDefault }]}> 
            <Text style={[styles.rulesCtaText, { color: palette.textPrimary }]}>Bekijk voorbeeldthread</Text>
            <Feather name="arrow-right" size={13} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.privacyNote, { color: palette.textMuted }]}> 
          Anoniem handle per kanaal. Geen echte namen of foto's. Voorlopig read-only voor gratis gebruikers.
        </Text>
        {errorText ? <Text style={[styles.errorText, { color: "#ef4444" }]}>{errorText}</Text> : null}
      </ScrollView>

      <PlusModal visible={showPlus} reason="community" onClose={() => setShowPlus(false)} />
    </SafeAreaView>
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
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 15, fontWeight: "500" },
  body: { padding: 16, paddingBottom: 40 },
  heroCard: {
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    right: -70,
    top: -90,
    borderRadius: 110,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
  },
  plusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  plusBadgeText: {
    color: "#0a0a0a",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: 34,
    marginBottom: 10,
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  heroFacts: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  heroFactPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  heroFactText: { fontSize: 11.5, fontWeight: "500" },
  heroCta: {
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCtaText: {
    color: "#0a0a0a",
    fontSize: 14,
    fontWeight: "700",
  },
  identityCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    marginBottom: 14,
  },
  identityLabel: { fontSize: 10.5, letterSpacing: 0.5, fontWeight: "600", marginBottom: 8 },
  identityRow: { flexDirection: "row", gap: 8 },
  identityInput: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: 10,
    minHeight: 42,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  identityBtn: {
    minWidth: 88,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  identityBtnText: { color: "#0a0a0a", fontWeight: "700", fontSize: 12.5 },
  identityHint: { marginTop: 7, fontSize: 11.5 },
  composeCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    marginBottom: 16,
  },
  composeTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  composeInput: {
    minHeight: 84,
    borderWidth: 0.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 14,
    marginBottom: 10,
    textAlignVertical: "top",
  },
  composeBtn: { minHeight: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  composeBtnText: { color: "#0a0a0a", fontSize: 13, fontWeight: "700" },
  lockedCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    marginBottom: 16,
  },
  lockedTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  lockedBody: { fontSize: 12.5, lineHeight: 18, marginBottom: 10 },
  lockedBtn: {
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedBtnText: { fontSize: 12.5, fontWeight: "600" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  filterRow: { gap: 8, paddingRight: 10, marginBottom: 16 },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 0.5,
    minHeight: 38,
    justifyContent: "center",
  },
  filterText: { fontSize: 12.5, fontWeight: "500" },
  list: { gap: 10, marginBottom: 18 },
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTopLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardLabel: { fontSize: 15, fontWeight: "600" },
  cardHint: { fontSize: 12.5, marginTop: 2, marginBottom: 6 },
  cardMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardMetaText: { fontSize: 11.5 },
  dot: { width: 3, height: 3, borderRadius: 2 },
  lockChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 0.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  lockChipText: {
    fontSize: 9.5,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  guidelineCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 14,
  },
  guidelineTitle: { fontSize: 14.5, fontWeight: "600", marginBottom: 10 },
  ruleRow: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 8 },
  ruleText: { flex: 1, fontSize: 12.5, lineHeight: 18 },
  rulesCta: {
    marginTop: 4,
    borderWidth: 0.5,
    borderRadius: 10,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  rulesCtaText: { fontSize: 12.5, fontWeight: "600" },
  loadingBox: { paddingVertical: 16, alignItems: "center" },
  emptyCard: { borderRadius: 12, borderWidth: 0.5, padding: 12, marginBottom: 14 },
  emptyTitle: { fontSize: 13, fontWeight: "600", marginBottom: 3 },
  emptyBody: { fontSize: 12, lineHeight: 17 },
  feedList: { gap: 10, marginBottom: 16 },
  postCard: { borderWidth: 0.5, borderRadius: 12, padding: 12 },
  postHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 6 },
  postNick: { fontSize: 13, fontWeight: "700" },
  postMeta: { fontSize: 11.5 },
  postBody: { fontSize: 13.5, lineHeight: 20, marginBottom: 10 },
  postActions: { flexDirection: "row", justifyContent: "flex-end" },
  dmBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 0.5,
    borderRadius: 999,
    minHeight: 36,
    paddingHorizontal: 10,
  },
  dmBtnText: { fontSize: 12.5, fontWeight: "500" },
  privacyNote: {
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: "center",
    paddingHorizontal: 16,
    marginTop: 2,
  },
  errorText: { marginTop: 8, fontSize: 12 },
});
