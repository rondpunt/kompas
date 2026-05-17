import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { profileApi, KompasProfile } from "@/src/api/profile";
import {
  SECTIONS,
  ProfileSectionKey,
  ROL_OPTIONS,
  TRANSITIE_OPTIONS,
  VRAAGSTIJL_OPTIONS,
  WAT_HELPT_OPTIONS,
  ENERGIE_OPTIONS,
  WAARDEN_OPTIONS,
  DIAGNOSE_OPTIONS,
  VERTROUWENS_OPTIONS,
} from "@/src/data/profileSections";

type Field =
  | { kind: "text"; key: string; label: string; placeholder?: string; multiline?: boolean }
  | { kind: "number"; key: string; label: string; placeholder?: string }
  | { kind: "select"; key: string; label: string; options: { id: string; label: string }[] }
  | { kind: "multi"; key: string; label: string; options: string[] | { id: string; label: string }[]; maxCount?: number }
  | { kind: "slider"; key: string; label: string; min: number; max: number; leftLabel: string; rightLabel: string }
  | { kind: "section-note"; text: string };

const FIELDS_BY_SECTION: Record<ProfileSectionKey, Field[]> = {
  basis: [
    { kind: "text", key: "voornaam", label: "Voornaam (of roepnaam)", placeholder: "bv. Sam" },
    { kind: "text", key: "aanspreken", label: "Hoe wil je aangesproken worden?", placeholder: "bv. 'gewoon Sam, jij niet u'" },
    {
      kind: "select",
      key: "voornaamwoorden",
      label: "Voornaamwoorden",
      options: [
        { id: "hij/hem", label: "hij/hem" },
        { id: "zij/haar", label: "zij/haar" },
        { id: "die/diens", label: "die/diens" },
        { id: "anders", label: "anders / liever niet" },
      ],
    },
    { kind: "number", key: "geboortejaar", label: "Geboortejaar (alleen jaar)", placeholder: "bv. 1990" },
  ],
  communicatie: [
    {
      kind: "section-note",
      text: "Dit gebruikt Kompas om met je af te stemmen. Verschijnt nooit ergens anders.",
    },
    {
      kind: "slider",
      key: "toon",
      label: "Toon",
      min: 1,
      max: 5,
      leftLabel: "direct",
      rightLabel: "zacht",
    },
    {
      kind: "slider",
      key: "lengte",
      label: "Lengte",
      min: 1,
      max: 5,
      leftLabel: "kort",
      rightLabel: "uitgebreid",
    },
    {
      kind: "select",
      key: "humor",
      label: "Humor",
      options: [
        { id: "graag", label: "Droge humor welkom" },
        { id: "neutraal", label: "Neutraal" },
        { id: "liever_niet", label: "Liever serieus" },
      ],
    },
    {
      kind: "multi",
      key: "vraag_stijl",
      label: "Vraag-stijl die je waardeert",
      options: VRAAGSTIJL_OPTIONS,
    },
    {
      kind: "multi",
      key: "wat_helpt",
      label: "Wat help je doorgaans als je iets deelt?",
      options: WAT_HELPT_OPTIONS,
    },
    {
      kind: "text",
      key: "vermijd_zinnen",
      label: "Woorden die je liever niet hoort (komma-gescheiden)",
      placeholder: "bv. kop op, gewoon doen, wees positief",
    },
    {
      kind: "text",
      key: "pet_peeves",
      label: "Pet peeves in gesprekken",
      multiline: true,
      placeholder: "Optioneel",
    },
  ],
  levenscontext: [
    {
      kind: "select",
      key: "levenssituatie",
      label: "Levenssituatie",
      options: [
        { id: "alleenwonend", label: "Alleenwonend" },
        { id: "samenwonend", label: "Samenwonend" },
        { id: "met_kinderen", label: "Met partner + kinderen" },
        { id: "bij_ouders", label: "Bij ouders" },
        { id: "anders", label: "Anders" },
      ],
    },
    {
      kind: "select",
      key: "werksituatie",
      label: "Werksituatie",
      options: [
        { id: "werk", label: "Werk" },
        { id: "studie", label: "Studie" },
        { id: "zoekend", label: "Zoekend" },
        { id: "arbeidsongeschikt", label: "Arbeidsongeschikt" },
        { id: "gepensioneerd", label: "Gepensioneerd" },
        { id: "mantelzorger", label: "Mantelzorger" },
      ],
    },
    { kind: "multi", key: "rollen", label: "Belangrijkste rollen nu", options: ROL_OPTIONS },
    { kind: "multi", key: "recente_transitie", label: "Recente grote transitie", options: TRANSITIE_OPTIONS },
  ],
  wat_werkt: [
    { kind: "multi", key: "energie_bronnen", label: "Wat geeft je energie?", options: ENERGIE_OPTIONS },
    {
      kind: "text",
      key: "coping",
      label: "Coping die werkt (komma-gescheiden)",
      placeholder: "bv. wandelen, schrijven, met X bellen",
    },
    {
      kind: "text",
      key: "herstel_na_overprikkeling",
      label: "Wat herstelt je na een rotdag?",
      multiline: true,
      placeholder: "Optioneel",
    },
    {
      kind: "select",
      key: "beste_tijd_dag",
      label: "Wanneer functioneer je het best?",
      options: [
        { id: "ochtend", label: "Ochtend" },
        { id: "midden", label: "Midden op de dag" },
        { id: "avond", label: "Avond" },
        { id: "nacht", label: "Nacht" },
        { id: "wisselend", label: "Wisselend" },
      ],
    },
  ],
  mentaal: [
    {
      kind: "section-note",
      text: "Volledig optioneel — alleen invullen als je dat wil.",
    },
    {
      kind: "select",
      key: "hulpverlening",
      label: "Ervaring met hulpverlening",
      options: [
        { id: "nooit", label: "Nooit" },
        { id: "verleden", label: "In het verleden" },
        { id: "loopt_nu", label: "Loopt nu" },
      ],
    },
    { kind: "multi", key: "diagnoses", label: "Bekende diagnoses (optioneel)", options: DIAGNOSE_OPTIONS },
    {
      kind: "text",
      key: "patronen",
      label: "Patroon dat je over jezelf weet",
      multiline: true,
      placeholder: "bv. ik kropt te lang op",
    },
  ],
  waarden: [
    { kind: "multi", key: "top_waarden", label: "Top 3 waarden nu", options: WAARDEN_OPTIONS, maxCount: 3 },
    {
      kind: "text",
      key: "richting",
      label: "Over een jaar zou ik graag…",
      multiline: true,
      placeholder: "Eén zin",
    },
    { kind: "text", key: "trots", label: "Waar ben je trots op?", multiline: true, placeholder: "Optioneel" },
  ],
  steun: [
    { kind: "multi", key: "vertrouwens_rollen", label: "Wie kun je opvertrouwen? (rollen)", options: VERTROUWENS_OPTIONS },
    {
      kind: "slider",
      key: "hulp_vragen_gemak",
      label: "Hulp vragen gaat me…",
      min: 1,
      max: 5,
      leftLabel: "moeilijk",
      rightLabel: "makkelijk",
    },
    {
      kind: "slider",
      key: "eenzaamheid",
      label: "Voel je je vaak eenzaam?",
      min: 1,
      max: 5,
      leftLabel: "nooit",
      rightLabel: "vaak",
    },
    { kind: "text", key: "crisis_contact", label: "Beste contact in crisis (anoniem)", placeholder: "bv. mijn beste vriendin" },
  ],
  levensbeschouwing: [
    {
      kind: "select",
      key: "speelt_rol",
      label: "Speelt geloof of spiritualiteit een rol?",
      options: [
        { id: "ja", label: "Ja" },
        { id: "nee", label: "Nee" },
        { id: "soms", label: "Soms" },
      ],
    },
    { kind: "text", key: "toelichting", label: "Toelichting (optioneel)", multiline: true },
    { kind: "text", key: "cultureel_kader", label: "Cultureel kader (optioneel)" },
  ],
};

export default function SectionEditor() {
  const { palette } = useTheme();
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();
  const sectionKey = (section as ProfileSectionKey) || "basis";
  const meta = SECTIONS.find((s) => s.key === sectionKey);
  const fields = FIELDS_BY_SECTION[sectionKey] || [];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});
  const [profile, setProfile] = useState<KompasProfile | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await profileApi.get();
      setProfile(res.profile);
      const sect = (res.profile as any)[sectionKey] || {};
      // Convert array fields to string for "vermijd_zinnen" and "coping" (UI is comma-separated)
      const ui = { ...sect };
      if (Array.isArray(ui.vermijd_zinnen)) ui.vermijd_zinnen = ui.vermijd_zinnen.join(", ");
      if (Array.isArray(ui.coping)) ui.coping = ui.coping.join(", ");
      setValues(ui);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [sectionKey]);

  useEffect(() => {
    load();
  }, [load]);

  const updateField = (key: string, val: any) => setValues((s) => ({ ...s, [key]: val }));

  const toggleMulti = (key: string, optionId: string, max?: number) => {
    setValues((s) => {
      const cur: string[] = Array.isArray(s[key]) ? [...s[key]] : [];
      const idx = cur.indexOf(optionId);
      if (idx >= 0) cur.splice(idx, 1);
      else {
        if (max && cur.length >= max) cur.shift(); // drop oldest
        cur.push(optionId);
      }
      return { ...s, [key]: cur };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      // Transform string-csv fields back to arrays
      const payload: Record<string, any> = { ...values };
      if (typeof payload.vermijd_zinnen === "string") {
        payload.vermijd_zinnen = payload.vermijd_zinnen
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
      if (typeof payload.coping === "string") {
        payload.coping = payload.coping
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
      if (typeof payload.geboortejaar === "string") {
        const n = parseInt(payload.geboortejaar, 10);
        payload.geboortejaar = Number.isFinite(n) ? n : null;
      }
      await profileApi.patch(sectionKey, payload);
      router.back();
    } catch (e) {
      console.warn(e);
    } finally {
      setSaving(false);
    }
  };

  if (!meta) return null;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.topBar, { borderBottomColor: palette.borderDefault }]}>
        <TouchableOpacity testID="section-back" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: palette.textPrimary }]} numberOfLines={1}>
          {meta.title}
        </Text>
        <TouchableOpacity testID="section-save" onPress={save} disabled={saving} style={styles.saveBtn}>
          {saving ? (
            <ActivityIndicator size="small" color={palette.accent} />
          ) : (
            <Text style={[styles.saveText, { color: palette.accent }]}>Bewaar</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.accent} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={[styles.heroPill, { backgroundColor: meta.tintSoft, borderColor: meta.tint + "44" }]}>
              <Feather name={meta.icon} size={14} color={meta.tint} />
              <Text style={[styles.heroPillText, { color: meta.tint }]}>{meta.subtitle}</Text>
            </View>

            {fields.map((f, idx) => renderField(f, idx, values, updateField, toggleMulti, palette, meta.tint))}

            <Text style={[styles.foot, { color: palette.textFaint }]}>
              Niets is verplicht. Sla op wat voor jou klopt; de rest blijft leeg tot je later wil.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function renderField(
  f: Field,
  idx: number,
  values: Record<string, any>,
  updateField: (k: string, v: any) => void,
  toggleMulti: (k: string, id: string, max?: number) => void,
  palette: any,
  tint: string,
) {
  if (f.kind === "section-note") {
    return (
      <Text key={`note-${idx}`} style={[styles.note, { color: palette.textMuted }]}>
        {f.text}
      </Text>
    );
  }
  const labelEl = (
    <Text style={[styles.fieldLabel, { color: palette.textPrimary }]}>{(f as any).label}</Text>
  );
  if (f.kind === "text" || f.kind === "number") {
    return (
      <View key={f.key} style={styles.field}>
        {labelEl}
        <TextInput
          value={values[f.key]?.toString() ?? ""}
          onChangeText={(t) => updateField(f.key, t)}
          placeholder={f.placeholder}
          placeholderTextColor={palette.textMuted}
          keyboardType={f.kind === "number" ? "number-pad" : "default"}
          multiline={(f as any).multiline}
          style={[
            styles.textInput,
            {
              backgroundColor: palette.surfaceElevated,
              borderColor: palette.borderSubtle,
              color: palette.textPrimary,
              minHeight: (f as any).multiline ? 76 : 42,
              textAlignVertical: (f as any).multiline ? "top" : "center",
            },
            Platform.OS === "web" ? ({ outlineStyle: "none", outline: "none" } as any) : null,
          ]}
          underlineColorAndroid="transparent"
          selectionColor={tint}
        />
      </View>
    );
  }
  if (f.kind === "select") {
    return (
      <View key={f.key} style={styles.field}>
        {labelEl}
        <View style={styles.chipsRow}>
          {f.options.map((o) => {
            const active = values[f.key] === o.id;
            return (
              <TouchableOpacity
                key={o.id}
                testID={`field-${f.key}-${o.id}`}
                onPress={() => updateField(f.key, active ? null : o.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? tint : palette.surfaceElevated,
                    borderColor: active ? tint : palette.borderSubtle,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: active ? "#0a0a0a" : palette.textPrimary }]}>
                  {o.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }
  if (f.kind === "multi") {
    const opts =
      (f.options as any[]).length && typeof (f.options as any[])[0] === "string"
        ? (f.options as string[]).map((s) => ({ id: s, label: s }))
        : (f.options as { id: string; label: string }[]);
    const selected: string[] = Array.isArray(values[f.key]) ? values[f.key] : [];
    return (
      <View key={f.key} style={styles.field}>
        {labelEl}
        {f.maxCount && (
          <Text style={[styles.fieldHint, { color: palette.textMuted }]}>Kies tot {f.maxCount}.</Text>
        )}
        <View style={styles.chipsRow}>
          {opts.map((o) => {
            const active = selected.includes(o.id);
            return (
              <TouchableOpacity
                key={o.id}
                testID={`field-${f.key}-${o.id}`}
                onPress={() => toggleMulti(f.key, o.id, (f as any).maxCount)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? tint : palette.surfaceElevated,
                    borderColor: active ? tint : palette.borderSubtle,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: active ? "#0a0a0a" : palette.textPrimary }]}>
                  {o.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }
  if (f.kind === "slider") {
    const cur = values[f.key];
    return (
      <View key={f.key} style={styles.field}>
        {labelEl}
        <View style={styles.sliderRow}>
          {Array.from({ length: f.max - f.min + 1 }).map((_, i) => {
            const val = f.min + i;
            const active = cur === val;
            return (
              <TouchableOpacity
                key={val}
                testID={`field-${f.key}-${val}`}
                onPress={() => updateField(f.key, val)}
                style={[
                  styles.sliderDot,
                  {
                    backgroundColor: active ? tint : palette.surfaceElevated,
                    borderColor: active ? tint : palette.borderSubtle,
                  },
                ]}
              >
                <Text style={[styles.sliderDotText, { color: active ? "#0a0a0a" : palette.textMuted }]}>
                  {val}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.sliderLabels}>
          <Text style={[styles.sliderEnd, { color: palette.textMuted }]}>{f.leftLabel}</Text>
          <Text style={[styles.sliderEnd, { color: palette.textMuted }]}>{f.rightLabel}</Text>
        </View>
      </View>
    );
  }
  return null;
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
  topTitle: { flex: 1, fontSize: 15, fontWeight: "500", textAlign: "center" },
  saveBtn: { paddingHorizontal: 14, height: 40, justifyContent: "center" },
  saveText: { fontSize: 14, fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  body: { padding: 16, paddingBottom: 60 },
  heroPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 0.5,
    marginBottom: 16,
  },
  heroPillText: { fontSize: 11.5, fontWeight: "500" },
  field: { marginBottom: 22 },
  fieldLabel: { fontSize: 13, fontWeight: "500", marginBottom: 8 },
  fieldHint: { fontSize: 11.5, marginBottom: 8, marginTop: -4 },
  textInput: {
    borderTopWidth: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    lineHeight: 19,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 0.5,
  },
  chipText: { fontSize: 12.5, fontWeight: "500" },
  sliderRow: { flexDirection: "row", gap: 6, justifyContent: "space-between" },
  sliderDot: {
    width: 44,
    height: 38,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  sliderDotText: { fontSize: 14, fontWeight: "600" },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  sliderEnd: { fontSize: 11 },
  note: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 18,
    fontStyle: "italic",
  },
  foot: {
    fontSize: 11.5,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 16,
  },
});
