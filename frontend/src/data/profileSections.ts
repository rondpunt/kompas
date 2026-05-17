// Profile section definitions (UI metadata) — shared by overview + editors.
// Keeping it in one place makes adding/changing sections trivial.

import { Feather } from "@expo/vector-icons";

export type ProfileSectionKey =
  | "basis"
  | "levenscontext"
  | "communicatie"
  | "wat_werkt"
  | "mentaal"
  | "waarden"
  | "steun"
  | "levensbeschouwing";

export interface SectionMeta {
  key: ProfileSectionKey;
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  tint: string;
  tintSoft: string;
  important?: boolean; // Important sections come first in UI
}

export const SECTIONS: SectionMeta[] = [
  {
    key: "basis",
    title: "Basis",
    subtitle: "Naam, hoe je aangesproken wil worden",
    icon: "user",
    tint: "#f59e0b",
    tintSoft: "rgba(245, 158, 11, 0.14)",
    important: true,
  },
  {
    key: "communicatie",
    title: "Hoe ‘k met jou praat",
    subtitle: "Toon, lengte, wat je liever niet hoort",
    icon: "message-circle",
    tint: "#5eead4",
    tintSoft: "rgba(94, 234, 212, 0.12)",
    important: true,
  },
  {
    key: "levenscontext",
    title: "Levenscontext",
    subtitle: "Werk, gezin, rollen, transities",
    icon: "layers",
    tint: "#93c5fd",
    tintSoft: "rgba(147, 197, 253, 0.12)",
  },
  {
    key: "wat_werkt",
    title: "Wat werkt voor jou",
    subtitle: "Energiebronnen, coping, beste tijd",
    icon: "zap",
    tint: "#fcd34d",
    tintSoft: "rgba(252, 211, 77, 0.12)",
  },
  {
    key: "waarden",
    title: "Waarden & richting",
    subtitle: "Wat voor jou belangrijk is",
    icon: "compass",
    tint: "#d8b4fe",
    tintSoft: "rgba(216, 180, 254, 0.12)",
  },
  {
    key: "steun",
    title: "Steun & relaties",
    subtitle: "Wie je kan vertrouwen",
    icon: "users",
    tint: "#bfdbfe",
    tintSoft: "rgba(191, 219, 254, 0.12)",
  },
  {
    key: "mentaal",
    title: "Mentale gezondheid",
    subtitle: "Optioneel — alleen als je wil",
    icon: "heart",
    tint: "#fda4af",
    tintSoft: "rgba(253, 164, 175, 0.10)",
  },
  {
    key: "levensbeschouwing",
    title: "Levensbeschouwelijk",
    subtitle: "Optioneel",
    icon: "moon",
    tint: "#a8b3cf",
    tintSoft: "rgba(168, 179, 207, 0.10)",
  },
];

// Reusable chip-multi-select option sets
export const ROL_OPTIONS = [
  "ouder",
  "partner",
  "professional",
  "student",
  "mantelzorger",
  "creatieveling",
  "leider",
  "vriend",
];

export const TRANSITIE_OPTIONS = [
  "verhuizing",
  "verlies",
  "scheiding",
  "nieuwe baan",
  "kind gekregen",
  "ziekte",
  "anders",
];

export const VRAAGSTIJL_OPTIONS = [
  { id: "luisteren", label: "Vooral luisteren" },
  { id: "doorvragen", label: "Actief doorvragen" },
  { id: "perspectief", label: "Perspectief bieden" },
  { id: "praktisch", label: "Praktisch advies" },
];

export const WAT_HELPT_OPTIONS = [
  { id: "gehoord", label: "Gehoord worden" },
  { id: "valideren", label: "Valideren" },
  { id: "doorvragen", label: "Doorvragen" },
  { id: "herkaderen", label: "Herkaderen" },
  { id: "plan", label: "Een plan maken" },
  { id: "gewoon_praten", label: "Niets doen — gewoon praten" },
];

export const ENERGIE_OPTIONS = [
  "alleen-tijd",
  "sociale tijd",
  "beweging",
  "natuur",
  "creëren",
  "leren",
  "helpen",
  "slapen",
  "eten",
  "muziek",
  "gamen",
  "lezen",
];

export const WAARDEN_OPTIONS = [
  "vrijheid",
  "verbinding",
  "groei",
  "rust",
  "prestatie",
  "creativiteit",
  "integriteit",
  "avontuur",
  "stabiliteit",
  "gezin",
  "gezondheid",
  "rechtvaardigheid",
  "spel",
  "eerlijkheid",
  "moed",
];

export const DIAGNOSE_OPTIONS = [
  "ADHD",
  "autisme",
  "depressie",
  "angst",
  "PTSS",
  "OCS",
  "bipolair",
  "eetstoornis",
  "persoonlijkheidsstoornis",
  "verslaving",
];

export const VERTROUWENS_OPTIONS = [
  "partner",
  "ouder",
  "vriend",
  "broer/zus",
  "collega",
  "therapeut",
  "huisarts",
  "anders",
];
