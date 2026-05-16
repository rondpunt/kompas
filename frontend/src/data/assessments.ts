// Kompas — 24 gevalideerde zelftesten
// Belgisch Nederlands.

export type AnswerOption = { value: number; label: string };

export interface QuestionWithOptions {
  text: string;
  options: AnswerOption[];
}

export type Question = string | QuestionWithOptions | { text: string; positiveIfDisagree?: boolean; reversed?: boolean };

export interface Interpretation {
  label: string;
  tier: "low" | "mid" | "high";
}

export interface Assessment {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  questionCount: number;
  estimatedMinutes: number;
  source: string;
  freeTier: boolean;
  intro: string;
  answerOptions?: AnswerOption[];
  questions: Question[];
  reversedItems?: number[];
  maxScore: number;
  scoreFunction: (answers: number[]) => number;
  subscaleScores?: (answers: number[]) => Record<string, number>;
  interpret: (score: number, answers?: number[]) => Interpretation;
  crisisCheck?: (answers: number[]) => boolean;
  contextLabel?: string; // e.g. "in de afgelopen 2 weken"
}

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

const yesNoOptions: AnswerOption[] = [
  { value: 0, label: "Nee" },
  { value: 1, label: "Ja" },
];

const freq4Options: AnswerOption[] = [
  { value: 0, label: "Helemaal niet" },
  { value: 1, label: "Enkele dagen" },
  { value: 2, label: "Meer dan de helft van de dagen" },
  { value: 3, label: "Bijna elke dag" },
];

const freq5Options: AnswerOption[] = [
  { value: 0, label: "Nooit" },
  { value: 1, label: "Zelden" },
  { value: 2, label: "Soms" },
  { value: 3, label: "Vaak" },
  { value: 4, label: "Heel vaak" },
];

// ─── ASSESSMENTS ─────────────────────────────────────

export const ASSESSMENTS: Record<string, Assessment> = {
  phq9: {
    id: "phq9",
    title: "PHQ-9",
    subtitle: "Depressie",
    category: "stemming",
    description: "Screening voor depressieve klachten. 9 vragen over de afgelopen 2 weken.",
    questionCount: 9,
    estimatedMinutes: 3,
    source: "Kroenke, Spitzer & Williams (2001)",
    freeTier: true,
    contextLabel: "in de afgelopen 2 weken",
    intro: "Hoe vaak heb je in de afgelopen 2 weken last gehad van de volgende klachten?",
    answerOptions: freq4Options,
    questions: [
      "Weinig interesse of plezier in dingen",
      "Neerslachtig, depressief of hopeloos voelen",
      "Moeite met inslapen, doorslapen, of juist te veel slapen",
      "Vermoeid voelen of weinig energie hebben",
      "Slechte eetlust of teveel eten",
      "Een slecht gevoel over jezelf hebben — of het gevoel dat je een mislukking bent of dat je jezelf of je familie hebt teleurgesteld",
      "Moeite met concentreren op dingen, zoals een krant lezen of tv kijken",
      "Zo langzaam bewegen of praten dat anderen het opmerkten — óf zo onrustig of rusteloos dat je veel meer rondliep dan gewoonlijk",
      "Gedachten dat je beter af zou zijn als je dood was of jezelf op de een of andere manier kwaad zou doen",
    ],
    maxScore: 27,
    scoreFunction: sum,
    interpret: (s) => {
      if (s <= 4) return { label: "Minimaal", tier: "low" };
      if (s <= 9) return { label: "Mild", tier: "low" };
      if (s <= 14) return { label: "Matig", tier: "mid" };
      if (s <= 19) return { label: "Matig-ernstig", tier: "mid" };
      return { label: "Ernstig", tier: "high" };
    },
    crisisCheck: (a) => a[8] >= 1,
  },

  gad7: {
    id: "gad7",
    title: "GAD-7",
    subtitle: "Angst",
    category: "angst",
    description: "Screening voor gegeneraliseerde angst. 7 vragen over de afgelopen 2 weken.",
    questionCount: 7,
    estimatedMinutes: 2,
    source: "Spitzer et al. (2006)",
    freeTier: true,
    contextLabel: "in de afgelopen 2 weken",
    intro: "Hoe vaak heb je in de afgelopen 2 weken last gehad van de volgende klachten?",
    answerOptions: freq4Options,
    questions: [
      "Zenuwachtig, angstig of gespannen voelen",
      "Niet kunnen stoppen met of niet kunnen controleren van piekeren",
      "Ergens te veel zorgen over maken",
      "Moeite met ontspannen",
      "Zo rusteloos zijn dat het moeilijk is om stil te zitten",
      "Gemakkelijk geïrriteerd of geërgerd raken",
      "Bang zijn dat er iets vreselijks zal gebeuren",
    ],
    maxScore: 21,
    scoreFunction: sum,
    interpret: (s) => {
      if (s <= 4) return { label: "Minimaal", tier: "low" };
      if (s <= 9) return { label: "Mild", tier: "low" };
      if (s <= 14) return { label: "Matig", tier: "mid" };
      return { label: "Ernstig", tier: "high" };
    },
  },

  phq4: {
    id: "phq4",
    title: "PHQ-4",
    subtitle: "Snelle stemming- en angstcheck",
    category: "stemming",
    description: "De kortste gecombineerde screening voor depressie en angst.",
    questionCount: 4,
    estimatedMinutes: 1,
    source: "Kroenke et al. (2009)",
    freeTier: true,
    contextLabel: "in de afgelopen 2 weken",
    intro: "Hoe vaak heb je in de afgelopen 2 weken last gehad van het volgende?",
    answerOptions: freq4Options,
    questions: [
      "Zenuwachtig, angstig of gespannen voelen",
      "Niet kunnen stoppen met of controleren van piekeren",
      "Weinig interesse of plezier in dingen",
      "Neerslachtig, depressief of hopeloos voelen",
    ],
    maxScore: 12,
    scoreFunction: sum,
    subscaleScores: (a) => ({ Angst: a[0] + a[1], Depressie: a[2] + a[3] }),
    interpret: (s) => {
      if (s <= 2) return { label: "Normaal", tier: "low" };
      if (s <= 5) return { label: "Mild", tier: "low" };
      if (s <= 8) return { label: "Matig", tier: "mid" };
      return { label: "Ernstig", tier: "high" };
    },
  },

  who5: {
    id: "who5",
    title: "WHO-5",
    subtitle: "Welzijnsindex",
    category: "welzijn",
    description: "Hoe goed voel je je. Gaat over welbevinden, niet klachten.",
    questionCount: 5,
    estimatedMinutes: 1,
    source: "WHO (1998), Topp et al. (2015)",
    freeTier: true,
    contextLabel: "in de afgelopen 2 weken",
    intro: "Geef bij elke uitspraak aan welk antwoord het best past bij hoe je je in de afgelopen 2 weken hebt gevoeld.",
    answerOptions: [
      { value: 0, label: "Op geen enkel moment" },
      { value: 1, label: "Een beetje van de tijd" },
      { value: 2, label: "Minder dan de helft van de tijd" },
      { value: 3, label: "Meer dan de helft van de tijd" },
      { value: 4, label: "Het grootste deel van de tijd" },
      { value: 5, label: "De hele tijd" },
    ],
    questions: [
      "Ik voelde me opgewekt en in een goed humeur",
      "Ik voelde me kalm en ontspannen",
      "Ik voelde me actief en energiek",
      "Ik voelde me fris en uitgerust toen ik wakker werd",
      "Mijn dagelijks leven was gevuld met dingen die mij interesseren",
    ],
    maxScore: 100,
    scoreFunction: (a) => sum(a) * 4,
    interpret: (s) => {
      if (s >= 50) return { label: "Goed welbevinden", tier: "low" };
      if (s >= 28) return { label: "Laag welbevinden", tier: "mid" };
      return { label: "Zeer laag welbevinden", tier: "high" };
    },
  },

  pss10: {
    id: "pss10",
    title: "PSS-10",
    subtitle: "Stress",
    category: "welzijn",
    description: "Hoe stressvol heb je de afgelopen maand ervaren.",
    questionCount: 10,
    estimatedMinutes: 3,
    source: "Cohen, Kamarck & Mermelstein (1983)",
    freeTier: true,
    contextLabel: "in de afgelopen maand",
    intro: "Geef aan hoe vaak je je in de afgelopen maand op een bepaalde manier hebt gevoeld of gedacht.",
    answerOptions: [
      { value: 0, label: "Nooit" },
      { value: 1, label: "Bijna nooit" },
      { value: 2, label: "Soms" },
      { value: 3, label: "Redelijk vaak" },
      { value: 4, label: "Heel vaak" },
    ],
    questions: [
      "Hoe vaak ben je overstuur geweest door iets wat onverwacht gebeurde?",
      "Hoe vaak voelde je dat je belangrijke dingen in je leven niet onder controle had?",
      "Hoe vaak voelde je je nerveus en gestrest?",
      "Hoe vaak voelde je je zeker over je vermogen om met persoonlijke problemen om te gaan?",
      "Hoe vaak voelde je dat de dingen je goed lukten?",
      "Hoe vaak ontdekte je dat je niet kon omgaan met alle dingen die je moest doen?",
      "Hoe vaak kon je irritaties in je leven onder controle houden?",
      "Hoe vaak voelde je dat je het meeste de baas was?",
      "Hoe vaak werd je boos vanwege dingen die buiten je controle vielen?",
      "Hoe vaak voelde je dat moeilijkheden zo hoog opstapelden dat je ze niet kon overwinnen?",
    ],
    reversedItems: [3, 4, 6, 7],
    maxScore: 40,
    scoreFunction: (a) => {
      const rev = [3, 4, 6, 7];
      return a.reduce((s, v, i) => s + (rev.includes(i) ? 4 - v : v), 0);
    },
    interpret: (s) => {
      if (s <= 13) return { label: "Lage stress", tier: "low" };
      if (s <= 26) return { label: "Matige stress", tier: "mid" };
      return { label: "Hoge stress", tier: "high" };
    },
  },

  cdrisc10: {
    id: "cdrisc10",
    title: "CD-RISC-10",
    subtitle: "Veerkracht",
    category: "welzijn",
    description: "Meet veerkracht bij tegenslagen. Hoger is beter.",
    questionCount: 10,
    estimatedMinutes: 3,
    source: "Campbell-Sills & Stein (2007)",
    freeTier: true,
    contextLabel: "in de afgelopen maand",
    intro: "Geef aan in welke mate elk van deze uitspraken op jou van toepassing is over de afgelopen maand.",
    answerOptions: [
      { value: 0, label: "Helemaal niet waar" },
      { value: 1, label: "Zelden waar" },
      { value: 2, label: "Soms waar" },
      { value: 3, label: "Vaak waar" },
      { value: 4, label: "Bijna altijd waar" },
    ],
    questions: [
      "Ik kan me aanpassen aan veranderingen",
      "Ik kan met wat dan ook omgaan",
      "Ik probeer de humoristische kant te zien van problemen",
      "Omgaan met stress maakt me sterker",
      "Ik herstel meestal snel van ziekte, kwetsuur of andere tegenslagen",
      "Ik geloof dat ik mijn doelen kan bereiken, zelfs als er obstakels zijn",
      "Onder druk blijf ik gefocust en denk helder",
      "Ik raak niet snel ontmoedigd door mislukking",
      "Ik denk over mezelf als een sterk persoon wanneer ik problemen of uitdagingen aanpak",
      "Ik kan onaangename of pijnlijke gevoelens hanteren",
    ],
    maxScore: 40,
    scoreFunction: sum,
    interpret: (s) => {
      if (s > 32) return { label: "Hoge veerkracht", tier: "low" };
      if (s >= 25) return { label: "Gemiddelde veerkracht", tier: "low" };
      return { label: "Lage veerkracht", tier: "mid" };
    },
  },

  sias6: {
    id: "sias6",
    title: "SIAS-6",
    subtitle: "Sociale angst",
    category: "sociaal",
    description: "Korte screening voor angst in sociale situaties.",
    questionCount: 6,
    estimatedMinutes: 2,
    source: "Peters et al. (2012)",
    freeTier: true,
    intro: "Geef aan in welke mate elke uitspraak op jou van toepassing is.",
    answerOptions: [
      { value: 0, label: "Helemaal niet" },
      { value: 1, label: "Een beetje" },
      { value: 2, label: "Redelijk" },
      { value: 3, label: "Erg" },
      { value: 4, label: "Extreem" },
    ],
    questions: [
      "Ik word gespannen wanneer ik met mensen om me heen ben",
      "Ik vind het moeilijk om te interageren met mensen die ik niet ken",
      "Ik raak gespannen als ik moet socialiseren in mijn werk of studie",
      "Ik vind het moeilijk om iets te zeggen tegen een vreemde",
      "Ik raak gespannen als ik samen ben met één andere persoon",
      "Ik twijfel of ik wel weet wat ik moet zeggen in sociale situaties",
    ],
    maxScore: 24,
    scoreFunction: sum,
    interpret: (s) => {
      if (s < 7) return { label: "Laag", tier: "low" };
      if (s < 12) return { label: "Mogelijk klinisch", tier: "mid" };
      return { label: "Sterke aanwijzing", tier: "high" };
    },
  },

  scoff: {
    id: "scoff",
    title: "SCOFF",
    subtitle: "Eetstoornis-screener",
    category: "eten",
    description: "Vijf ja/nee vragen over eetgedrag.",
    questionCount: 5,
    estimatedMinutes: 1,
    source: "Morgan, Reid & Lacey (1999)",
    freeTier: true,
    intro: "Beantwoord elke vraag met Ja of Nee.",
    answerOptions: yesNoOptions,
    questions: [
      "Maak je jezelf misselijk omdat je je oncomfortabel vol voelt?",
      "Maak je je zorgen dat je de controle bent kwijtgeraakt over hoeveel je eet?",
      "Ben je in de afgelopen 3 maanden meer dan 6 kilo afgevallen?",
      "Geloof je dat je dik bent terwijl anderen zeggen dat je te dun bent?",
      "Zou je zeggen dat eten je leven beheerst?",
    ],
    maxScore: 5,
    scoreFunction: sum,
    interpret: (s) => {
      if (s < 2) return { label: "Geen aanwijzingen", tier: "low" };
      return { label: "Mogelijke aanwijzingen", tier: "high" };
    },
  },

  audit: {
    id: "audit",
    title: "AUDIT",
    subtitle: "Alcoholgebruik",
    category: "verslaving",
    description: "WHO-standaard voor screenen van alcoholgebruik. 10 vragen over het afgelopen jaar.",
    questionCount: 10,
    estimatedMinutes: 3,
    source: "WHO, Saunders et al. (1993)",
    freeTier: true,
    intro: "Beantwoord de vragen over je alcoholgebruik in het afgelopen jaar.",
    questions: [
      {
        text: "Hoe vaak drink je alcohol?",
        options: [
          { value: 0, label: "Nooit" },
          { value: 1, label: "Maandelijks of minder" },
          { value: 2, label: "2-4 keer per maand" },
          { value: 3, label: "2-3 keer per week" },
          { value: 4, label: "4 keer of vaker per week" },
        ],
      },
      {
        text: "Hoeveel standaardglazen drink je op een typische dag waarop je drinkt?",
        options: [
          { value: 0, label: "1 of 2" },
          { value: 1, label: "3 of 4" },
          { value: 2, label: "5 of 6" },
          { value: 3, label: "7, 8 of 9" },
          { value: 4, label: "10 of meer" },
        ],
      },
      {
        text: "Hoe vaak drink je 6 of meer standaardglazen op één gelegenheid?",
        options: [
          { value: 0, label: "Nooit" },
          { value: 1, label: "Minder dan maandelijks" },
          { value: 2, label: "Maandelijks" },
          { value: 3, label: "Wekelijks" },
          { value: 4, label: "Dagelijks of bijna dagelijks" },
        ],
      },
      {
        text: "Hoe vaak heb je in het afgelopen jaar gemerkt dat je niet kon stoppen met drinken zodra je begon?",
        options: [
          { value: 0, label: "Nooit" },
          { value: 1, label: "Minder dan maandelijks" },
          { value: 2, label: "Maandelijks" },
          { value: 3, label: "Wekelijks" },
          { value: 4, label: "Dagelijks of bijna dagelijks" },
        ],
      },
      {
        text: "Hoe vaak ben je in het afgelopen jaar verplichtingen niet nagekomen door alcohol?",
        options: [
          { value: 0, label: "Nooit" },
          { value: 1, label: "Minder dan maandelijks" },
          { value: 2, label: "Maandelijks" },
          { value: 3, label: "Wekelijks" },
          { value: 4, label: "Dagelijks of bijna dagelijks" },
        ],
      },
      {
        text: "Hoe vaak had je 's ochtends alcohol nodig om weer op gang te komen na een zware drinkdag?",
        options: [
          { value: 0, label: "Nooit" },
          { value: 1, label: "Minder dan maandelijks" },
          { value: 2, label: "Maandelijks" },
          { value: 3, label: "Wekelijks" },
          { value: 4, label: "Dagelijks of bijna dagelijks" },
        ],
      },
      {
        text: "Hoe vaak heb je je schuldig gevoeld na het drinken?",
        options: [
          { value: 0, label: "Nooit" },
          { value: 1, label: "Minder dan maandelijks" },
          { value: 2, label: "Maandelijks" },
          { value: 3, label: "Wekelijks" },
          { value: 4, label: "Dagelijks of bijna dagelijks" },
        ],
      },
      {
        text: "Hoe vaak kon je je niet meer herinneren wat er de avond ervoor was gebeurd door drinken?",
        options: [
          { value: 0, label: "Nooit" },
          { value: 1, label: "Minder dan maandelijks" },
          { value: 2, label: "Maandelijks" },
          { value: 3, label: "Wekelijks" },
          { value: 4, label: "Dagelijks of bijna dagelijks" },
        ],
      },
      {
        text: "Heb jij of iemand anders verwondingen opgelopen door jouw drinken?",
        options: [
          { value: 0, label: "Nee" },
          { value: 2, label: "Ja, maar niet in het afgelopen jaar" },
          { value: 4, label: "Ja, in het afgelopen jaar" },
        ],
      },
      {
        text: "Heeft een familielid, vriend, dokter of hulpverlener zich zorgen gemaakt over je drinken of voorgesteld dat je minder zou drinken?",
        options: [
          { value: 0, label: "Nee" },
          { value: 2, label: "Ja, maar niet in het afgelopen jaar" },
          { value: 4, label: "Ja, in het afgelopen jaar" },
        ],
      },
    ],
    maxScore: 40,
    scoreFunction: sum,
    interpret: (s) => {
      if (s <= 7) return { label: "Laag risico", tier: "low" };
      if (s <= 15) return { label: "Schadelijk niveau", tier: "mid" };
      if (s <= 19) return { label: "Schadelijk gebruik", tier: "mid" };
      return { label: "Probabele afhankelijkheid", tier: "high" };
    },
  },

  asrs6: {
    id: "asrs6",
    title: "ASRS-6",
    subtitle: "ADHD-screener (kort)",
    category: "adhd",
    description: "Zes-vragenversie van de WHO ASRS screener voor ADHD bij volwassenen.",
    questionCount: 6,
    estimatedMinutes: 2,
    source: "Kessler et al. / WHO (2005)",
    freeTier: false,
    contextLabel: "in de afgelopen 6 maanden",
    intro: "Beantwoord de vragen op basis van hoe je je in de afgelopen 6 maanden hebt gevoeld of gedragen.",
    answerOptions: freq5Options,
    questions: [
      "Hoe vaak heb je moeite om de laatste details af te ronden van een project, zodra de uitdagende delen gedaan zijn?",
      "Hoe vaak heb je moeite om dingen op orde te krijgen wanneer je een taak moet doen die organisatie vereist?",
      "Hoe vaak heb je problemen met het onthouden van afspraken of verplichtingen?",
      "Hoe vaak vermijd of stel je het begin van een taak uit die veel nadenken vereist?",
      "Hoe vaak friemel of beweeg je met handen of voeten als je lang moet stilzitten?",
      "Hoe vaak voel je je overactief en gedwongen om dingen te doen, alsof je gedreven wordt door een motor?",
    ],
    maxScore: 6,
    scoreFunction: (a) => {
      const thresholds = [2, 2, 2, 3, 3, 3];
      return a.filter((v, i) => v >= thresholds[i]).length;
    },
    interpret: (s) => {
      if (s < 4) return { label: "Weinig aanwijzingen", tier: "low" };
      return { label: "Symptomen consistent met ADHD", tier: "high" };
    },
  },

  asrs18: {
    id: "asrs18",
    title: "ASRS-18",
    subtitle: "ADHD-screener (volledig)",
    category: "adhd",
    description: "Volledige 18-vragenversie van de WHO ASRS screener.",
    questionCount: 18,
    estimatedMinutes: 5,
    source: "WHO/Harvard, Kessler et al.",
    freeTier: false,
    contextLabel: "in de afgelopen 6 maanden",
    intro: "Beantwoord de vragen op basis van hoe je je in de afgelopen 6 maanden hebt gevoeld of gedragen.",
    answerOptions: freq5Options,
    questions: [
      "Hoe vaak heb je moeite om de laatste details af te ronden van een project?",
      "Hoe vaak heb je moeite om dingen op orde te krijgen?",
      "Hoe vaak heb je problemen met het onthouden van afspraken of verplichtingen?",
      "Hoe vaak vermijd of stel je het begin van een taak uit die veel nadenken vereist?",
      "Hoe vaak friemel of beweeg je met handen of voeten als je lang moet stilzitten?",
      "Hoe vaak voel je je overactief en gedwongen om dingen te doen?",
      "Hoe vaak maak je slordige fouten als je aan een saai of moeilijk project moet werken?",
      "Hoe vaak heb je moeite je aandacht erbij te houden als je saai of monotoon werk doet?",
      "Hoe vaak vind je het moeilijk je te concentreren op wat iemand tegen je zegt?",
      "Hoe vaak verlies je dingen of leg je ze verkeerd thuis of op het werk?",
      "Hoe vaak word je afgeleid door activiteit of geluiden om je heen?",
      "Hoe vaak sta je op tijdens vergaderingen of situaties waarin je geacht wordt te blijven zitten?",
      "Hoe vaak voel je je rusteloos of onrustig?",
      "Hoe vaak heb je moeite om jezelf te ontspannen wanneer je vrije tijd hebt?",
      "Hoe vaak betrap je jezelf erop dat je te veel praat in sociale situaties?",
      "Hoe vaak maak je een gesprek af van anderen voordat zij zelf hebben kunnen afmaken?",
      "Hoe vaak vind je het moeilijk om op je beurt te wachten?",
      "Hoe vaak onderbreek je anderen wanneer ze bezig zijn?",
    ],
    maxScore: 72,
    scoreFunction: sum,
    subscaleScores: (a) => ({
      Aandacht: [0, 1, 2, 3, 6, 7, 8, 9, 10].reduce((s, i) => s + a[i], 0),
      Hyperactiviteit: [4, 5, 11, 12, 13, 14, 15, 16, 17].reduce((s, i) => s + a[i], 0),
    }),
    interpret: (s) => {
      if (s < 24) return { label: "Weinig aanwijzingen", tier: "low" };
      if (s < 40) return { label: "Matige aanwijzingen", tier: "mid" };
      return { label: "Sterke aanwijzingen ADHD", tier: "high" };
    },
  },

  aq10: {
    id: "aq10",
    title: "AQ-10",
    subtitle: "Autisme-spectrum (kort)",
    category: "autisme",
    description: "Tien vragen die aanwijzingen voor autisme-spectrum screening geven bij volwassenen.",
    questionCount: 10,
    estimatedMinutes: 3,
    source: "Allison, Auyeung & Baron-Cohen (2012)",
    freeTier: false,
    intro: "Geef voor elke uitspraak aan in welke mate je het ermee eens bent.",
    answerOptions: [
      { value: 0, label: "Helemaal mee eens" },
      { value: 1, label: "Een beetje mee eens" },
      { value: 2, label: "Een beetje mee oneens" },
      { value: 3, label: "Helemaal mee oneens" },
    ],
    questions: [
      "Ik merk vaak kleine geluiden op die anderen niet opmerken",
      "Ik concentreer me meestal meer op het geheel dan op kleine details",
      "Ik vind het makkelijk om meerdere dingen tegelijk te doen",
      "Als ik onderbroken word, kan ik snel weer terug naar wat ik aan het doen was",
      "Ik vind het makkelijk om 'tussen de regels door te lezen' wanneer iemand met me praat",
      "Ik weet hoe ik moet vertellen of iemand die naar me luistert, zich verveelt",
      "Als ik een verhaal lees, vind ik het moeilijk om de bedoelingen van personages te begrijpen",
      "Ik vind het leuk om informatie te verzamelen over categorieën dingen",
      "Ik vind het makkelijk om uit iemands gezicht op te maken wat die persoon denkt of voelt",
      "Ik vind het moeilijk uit te vissen wat iemands bedoelingen zijn",
    ],
    maxScore: 10,
    scoreFunction: (a) => {
      // positiveIfDisagree per question index
      const posIfDisagree = [true, false, false, false, true, false, true, true, false, true];
      return a.reduce((s, v, i) => s + (posIfDisagree[i] ? v >= 2 : v <= 1 ? 1 : 0), 0);
    },
    interpret: (s) => {
      if (s < 6) return { label: "Weinig aanwijzingen", tier: "low" };
      return { label: "Mogelijke aanwijzingen autisme", tier: "high" };
    },
  },

  raads14: {
    id: "raads14",
    title: "RAADS-14",
    subtitle: "Autisme bij volwassenen",
    category: "autisme",
    description: "Gevalideerde screeningsschaal voor autistisch spectrum bij volwassenen.",
    questionCount: 14,
    estimatedMinutes: 5,
    source: "Eriksson, Andersen & Bejerot (2013)",
    freeTier: false,
    intro: "Geef voor elke uitspraak aan welke optie het beste past bij hoe je doorgaans bent.",
    answerOptions: [
      { value: 0, label: "Nooit waar" },
      { value: 1, label: "Alleen waar toen ik jonger was (jonger dan 16)" },
      { value: 2, label: "Alleen waar nu" },
      { value: 3, label: "Waar nu en toen ik jonger was" },
    ],
    questions: [
      "Het is moeilijk voor mij om te voorkomen dat ik in trance raak bij dingen waar ik geïnteresseerd in ben",
      "Soms vergeet ik wat ik aan het zeggen was omdat ik te veel andere dingen denk tijdens het spreken",
      "Ik vind sociale situaties verwarrend",
      "Ik raak gemakkelijk overweldigd door fel licht of harde geluiden",
      "Ik vind het moeilijk te begrijpen wanneer iemand boos is of teleurgesteld is in mij",
      "Wanneer ik praat met iemand die ik niet ken, vind ik het moeilijk om oogcontact te maken",
      "Sommige gewone texturen die mensen niet erg vinden, voelen voor mij erg ongemakkelijk",
      "Wanneer ik praat met mensen, gebruik ik vaak grotere woorden dan nodig is",
      "Ik vind heel zachte aanrakingen pijnlijk",
      "Ik moet bewust werken aan oogcontact terwijl ik praat",
      "Ik kan niet vertellen wat iemand denkt door naar zijn/haar gezicht te kijken",
      "Ik raak van slag van een verandering in een bekende routine",
      "Ik kan niet uitvinden wat anderen verwachten dat ik ga doen",
      "Het is moeilijk voor mij om sociale codes te begrijpen die anderen vanzelf lijken te kennen",
    ],
    maxScore: 42,
    scoreFunction: sum,
    interpret: (s) => {
      if (s < 14) return { label: "Weinig aanwijzingen", tier: "low" };
      return { label: "Aanwijzingen autistisch spectrum", tier: "high" };
    },
  },

  msi_bpd: {
    id: "msi_bpd",
    title: "MSI-BPD",
    subtitle: "Borderline-screener",
    category: "borderline",
    description: "Screeningsinstrument voor borderline-persoonlijkheidstrekken.",
    questionCount: 10,
    estimatedMinutes: 3,
    source: "Zanarini et al. (2003)",
    freeTier: false,
    intro: "Beantwoord elke vraag op basis van hoe je je doorgaans voelt en gedraagt — niet alleen vandaag.",
    answerOptions: yesNoOptions,
    questions: [
      "Heeft een van je dichtste relaties last gehad van veel ruzies of herhaaldelijk verbreken?",
      "Heb je opzettelijk geprobeerd jezelf fysiek pijn te doen of heb je geprobeerd zelfmoord te plegen?",
      "Heb je minstens twee andere problemen gehad met impulsiviteit (bv. eet- en uitgavenproblemen, dronken rijden, middelenmisbruik)?",
      "Ben je extreem stemmingswisselend?",
      "Voel je je vaak boos of heb je woede-uitbarstingen?",
      "Voel je je vaak achterdochtig of paranoia tegenover anderen, of voel je je buiten jezelf staand?",
      "Voel je je vaak slecht over jezelf, of vind je dat je er nooit mag zijn?",
      "Voel je je chronisch leeg?",
      "Voel je je vaak wanhopig en bang dat mensen die om je geven weg zullen gaan, en doe je extreme dingen om dit te voorkomen?",
      "Verandert je beeld van wie je bent vaak en dramatisch — over doelen, vrienden of seksualiteit?",
    ],
    maxScore: 10,
    scoreFunction: sum,
    interpret: (s) => {
      if (s < 7) return { label: "Weinig aanwijzingen", tier: "low" };
      return { label: "Sterke aanwijzingen BPD", tier: "high" };
    },
    crisisCheck: (a) => a[1] === 1,
  },

  bsl23: {
    id: "bsl23",
    title: "BSL-23",
    subtitle: "Borderline-symptomen",
    category: "borderline",
    description: "Meet de intensiteit van borderline-symptomen in de afgelopen week.",
    questionCount: 23,
    estimatedMinutes: 7,
    source: "Bohus et al. (2009)",
    freeTier: false,
    contextLabel: "in de afgelopen week",
    intro: "In welke mate hebben de volgende uitspraken in de afgelopen week op jou betrekking gehad?",
    answerOptions: [
      { value: 0, label: "Helemaal niet" },
      { value: 1, label: "Een beetje" },
      { value: 2, label: "Redelijk" },
      { value: 3, label: "Veel" },
      { value: 4, label: "Heel erg" },
    ],
    questions: [
      "Het was moeilijk voor me om me te concentreren",
      "Ik voelde me hulpeloos",
      "Ik was bang ergens van uit te storten",
      "Ik voelde me boos op mezelf",
      "Ik voelde schaamte",
      "Ik voelde me waardeloos",
      "Ik kon mijn emoties niet sturen",
      "Ik wilde mezelf pijn doen",
      "Ik haatte mezelf",
      "Ik wilde dat ik dood was",
      "Ik voelde me leeg",
      "Ik voelde me snel beledigd",
      "Het kostte me veel moeite om alleen te zijn",
      "Ik voelde me afgewezen",
      "Ik voelde me onbegrepen",
      "Ik voelde dat anderen tegen me waren",
      "Mijn stemming wisselde snel",
      "Ik voelde dingen niet zoals andere mensen",
      "Ik voelde me vervreemd van mezelf",
      "Mijn lichaam voelde niet als van mezelf",
      "Ik kon niet voelen wat ik voelde",
      "Ik vertrouwde anderen niet",
      "Ik dacht dat anderen me iets aan wilden doen",
    ],
    maxScore: 92,
    scoreFunction: sum,
    interpret: (s) => {
      const avg = s / 23;
      if (avg < 0.5) return { label: "Laag", tier: "low" };
      if (avg < 1.5) return { label: "Licht", tier: "low" };
      if (avg < 2.5) return { label: "Matig", tier: "mid" };
      if (avg < 3.5) return { label: "Hoog", tier: "mid" };
      return { label: "Zeer hoog", tier: "high" };
    },
    crisisCheck: (a) => a[7] >= 2 || a[9] >= 2,
  },

  hsps23: {
    id: "hsps23",
    title: "HSPS",
    subtitle: "Hooggevoeligheid",
    category: "persoonlijkheid",
    description: "Meet of je hoogsensitief bent. Geen stoornis — een persoonlijkheidstrek.",
    questionCount: 23,
    estimatedMinutes: 8,
    source: "Aron & Aron (1997)",
    freeTier: false,
    intro: "Beantwoord elke vraag op basis van hoe je je voelt. Bij twijfel: hoe je je doorgaans hebt gevoeld.",
    answerOptions: [
      { value: 1, label: "Helemaal niet" },
      { value: 2, label: "Een beetje" },
      { value: 3, label: "Redelijk" },
      { value: 4, label: "Erg veel" },
      { value: 5, label: "Heel erg veel" },
    ],
    questions: [
      "Word je gemakkelijk overweldigd door sterke zintuiglijke prikkels?",
      "Lijk je gevoelig te zijn voor de stemmingen van anderen?",
      "Lijk je heel gevoelig te zijn voor pijn?",
      "Voel je tijdens drukke dagen de behoefte om je terug te trekken in bed of een donkere kamer?",
      "Ben je bijzonder gevoelig voor de effecten van cafeïne?",
      "Word je gemakkelijk overweldigd door dingen als helder licht, sterke geuren of ruwe stoffen?",
      "Heb je een rijk, complex innerlijk leven?",
      "Word je verstoord door luide geluiden?",
      "Word je diep ontroerd door kunst of muziek?",
      "Ben je gewetensvol?",
      "Schrik je gemakkelijk?",
      "Voel je je gestrest als je in korte tijd veel moet doen?",
      "Wanneer mensen zich ongemakkelijk voelen, weet jij meestal wat er moet gebeuren om hen comfortabeler te maken?",
      "Word je geërgerd wanneer mensen proberen je te veel dingen tegelijk te laten doen?",
      "Doe je je uiterste best om fouten te vermijden of dingen te vergeten?",
      "Vermijd je gewelddadige films en tv-shows?",
      "Voel je je onaangenaam opgewonden wanneer er veel om je heen gebeurt?",
      "Maakt sterke honger je sterk geconcentreerd of verstoort het je stemming?",
      "Maken veranderingen in je leven je in de war?",
      "Merk je en geniet je van delicate of fijne geuren, smaken, geluiden of kunstwerken?",
      "Vind je het belangrijk om je leven zo in te richten dat je overweldigende situaties vermijdt?",
      "Wanneer je moet concurreren of geobserveerd wordt, word je dan zo nerveus dat je slechter presteert?",
      "Omschreven je ouders of leraren je als kind als gevoelig of verlegen?",
    ],
    maxScore: 115,
    scoreFunction: sum,
    interpret: (s) => {
      const avg = s / 23;
      if (avg < 3.5) return { label: "Niet hoogsensitief", tier: "low" };
      return { label: "Hoogsensitief", tier: "low" };
    },
  },

  pcl5: {
    id: "pcl5",
    title: "PCL-5",
    subtitle: "PTSS (DSM-5)",
    category: "trauma",
    description: "Screening voor posttraumatische stressklachten. 20 vragen.",
    questionCount: 20,
    estimatedMinutes: 7,
    source: "Weathers et al. / National Center for PTSD (2013)",
    freeTier: false,
    contextLabel: "in de afgelopen maand",
    intro: "Hieronder vind je problemen die mensen soms hebben na een zeer stressvolle ervaring. Geef aan in welke mate je in de afgelopen maand last had van elk probleem.",
    answerOptions: [
      { value: 0, label: "Helemaal niet" },
      { value: 1, label: "Een beetje" },
      { value: 2, label: "Tamelijk" },
      { value: 3, label: "Veel" },
      { value: 4, label: "Heel erg" },
    ],
    questions: [
      "Herhalende, verstorende en onvrijwillige herinneringen aan de stressvolle ervaring",
      "Herhaalde, verstorende dromen over de stressvolle ervaring",
      "Plotseling voelen of handelen alsof de stressvolle ervaring opnieuw gebeurde",
      "Erg overstuur worden bij iets dat je herinnert aan de stressvolle ervaring",
      "Sterke fysieke reacties bij iets dat je herinnert aan de stressvolle ervaring",
      "Herinneringen, gedachten of gevoelens vermijden die te maken hebben met de stressvolle ervaring",
      "Externe herinneringen vermijden (mensen, plaatsen, gesprekken, activiteiten)",
      "Moeite hebben om belangrijke delen van de stressvolle ervaring te herinneren",
      "Sterke negatieve overtuigingen over jezelf, anderen of de wereld",
      "Jezelf of anderen de schuld geven van de stressvolle ervaring",
      "Sterke negatieve gevoelens zoals angst, woede, schuld of schaamte",
      "Verlies van interesse in activiteiten die je vroeger leuk vond",
      "Je afgesneden of vervreemd voelen van anderen",
      "Moeite hebben om positieve gevoelens te ervaren",
      "Geïrriteerd zijn, woede-uitbarstingen of agressief gedrag",
      "Roekeloos of zelfdestructief handelen",
      "Hyperalert zijn of constant op je hoede zijn",
      "Je gemakkelijk laten schrikken",
      "Moeite hebben om je te concentreren",
      "Slaapproblemen",
    ],
    maxScore: 80,
    scoreFunction: sum,
    interpret: (s) => {
      if (s < 33) return { label: "Laag PTSS-risico", tier: "low" };
      return { label: "Probabele klinische PTSS", tier: "high" };
    },
    crisisCheck: (a) => a[15] >= 2,
  },

  itq: {
    id: "itq",
    title: "ITQ",
    subtitle: "Complex trauma (ICD-11)",
    category: "trauma",
    description: "Screening voor PTSD en complexe PTSD volgens ICD-11 criteria.",
    questionCount: 18,
    estimatedMinutes: 6,
    source: "Cloitre et al. (2018)",
    freeTier: false,
    contextLabel: "in de afgelopen maand",
    intro: "Lees elk item zorgvuldig en geef aan in welke mate dit op jou van toepassing is in de afgelopen maand.",
    answerOptions: [
      { value: 0, label: "Helemaal niet" },
      { value: 1, label: "Een beetje" },
      { value: 2, label: "Matig" },
      { value: 3, label: "Veel" },
      { value: 4, label: "Heel erg" },
    ],
    questions: [
      "Verstorende dromen die de stressvolle ervaring lijken te herhalen",
      "Krachtige beelden of herinneringen die soms zomaar opkomen, vergezeld van angst of paniek",
      "Interne herinneringen vermijden (gedachten/gevoelens aan de ervaring)",
      "Externe herinneringen vermijden (mensen, plaatsen, activiteiten)",
      "Hyperalert, op de uitkijk",
      "Schrikachtig",
      "Heeft dit negatieve invloed op je relaties of sociale leven?",
      "Heeft dit negatieve invloed op werk of dagelijkse activiteiten?",
      "Heeft dit op andere gebieden negatieve impact?",
      "Wanneer ik overstuur ben, duurt het lang voor ik kalmeer",
      "Ik voel me emotioneel verdoofd",
      "Ik voel me een mislukking",
      "Ik voel me waardeloos",
      "Ik voel me afstandelijk of afgesneden van anderen",
      "Ik vind het moeilijk emotioneel verbonden te zijn",
      "Heeft dit negatieve impact op relaties of sociaal leven? (DSO)",
      "Heeft dit negatieve impact op werk? (DSO)",
      "Heeft dit op andere gebieden negatieve impact? (DSO)",
    ],
    maxScore: 72,
    scoreFunction: sum,
    interpret: (s) => {
      if (s < 15) return { label: "Weinig aanwijzingen", tier: "low" };
      if (s < 30) return { label: "Matige aanwijzingen PTSD", tier: "mid" };
      return { label: "Aanwijzingen complexe PTSD", tier: "high" };
    },
  },

  ocir: {
    id: "ocir",
    title: "OCI-R",
    subtitle: "Dwangmatige klachten",
    category: "ocd",
    description: "Screening voor obsessief-compulsieve klachten. 18 vragen.",
    questionCount: 18,
    estimatedMinutes: 5,
    source: "Foa et al. (2002)",
    freeTier: false,
    contextLabel: "in de afgelopen maand",
    intro: "Hieronder staan ervaringen die veel mensen hebben. Geef aan hoeveel last je in de afgelopen maand van elk hebt gehad.",
    answerOptions: [
      { value: 0, label: "Helemaal niet" },
      { value: 1, label: "Een beetje" },
      { value: 2, label: "Matig" },
      { value: 3, label: "Veel" },
      { value: 4, label: "Heel veel" },
    ],
    questions: [
      "Ik heb herhaaldelijk dingen opgeslagen waar ik niets aan heb",
      "Ik check dingen vaker dan nodig",
      "Ik raak van streek als voorwerpen niet goed gerangschikt zijn",
      "Ik krijg het gevoel dat ik bepaalde nummers moet tellen",
      "Ik vind het moeilijk om voorwerpen die ik niet meer nodig heb, weg te gooien",
      "Ik check sloten en kranen meerdere keren",
      "Ik raak van streek als anderen mijn voorwerpen veranderen",
      "Ik voel me gedwongen bepaalde nummers te tellen",
      "Ik vind dat ik mijn handen vaker moet wassen dan andere mensen",
      "Ik krijg vervelende gedachten waar ik me niet van kan ontdoen",
      "Ik vermijd voorwerpen die ik vies vind",
      "Ik krijg vervelende gedachten waar ik me schuldig over voel",
      "Ik moet dingen herhaaldelijk in dezelfde volgorde doen",
      "Ik raak overstuur als anderen mijn dingen aanraken",
      "Ik check dat de deur op slot zit voordat ik weg ga",
      "Ik voel me gedwongen om woorden of zinnen te herhalen in mijn hoofd",
      "Soms moet ik mezelf wassen omdat ik het gevoel heb besmet te zijn",
      "Mijn gedachten kunnen niet stoppen met denken aan iets vervelends",
    ],
    maxScore: 72,
    scoreFunction: sum,
    interpret: (s) => {
      if (s < 21) return { label: "Geen klinisch significant niveau", tier: "low" };
      return { label: "Klinisch significant OCD", tier: "high" };
    },
  },

  eat26: {
    id: "eat26",
    title: "EAT-26",
    subtitle: "Eetattitudes",
    category: "eten",
    description: "Uitgebreidere test voor verstoord eetgedrag en attitudes rond eten.",
    questionCount: 26,
    estimatedMinutes: 6,
    source: "Garner et al. (1982)",
    freeTier: false,
    intro: "Geef voor elke uitspraak aan hoe vaak deze op jou van toepassing is.",
    answerOptions: [
      { value: 3, label: "Altijd" },
      { value: 2, label: "Meestal" },
      { value: 1, label: "Vaak" },
      { value: 0, label: "Soms" },
      { value: 0, label: "Zelden" },
      { value: 0, label: "Nooit" },
    ],
    questions: [
      "Ik ben doodsbenauwd om te dik te worden",
      "Ik vermijd eten als ik honger heb",
      "Ik denk veel na over eten",
      "Ik heb buien waarin ik niet kan stoppen met eten",
      "Ik snijd mijn eten in kleine stukjes",
      "Ik weet de calorie-inhoud van het voedsel dat ik eet",
      "Ik vermijd eten met veel koolhydraten",
      "Anderen vinden dat ik te weinig zou eten",
      "Ik braak nadat ik gegeten heb",
      "Ik voel me erg schuldig na het eten",
      "Ik ben gepreoccupeerd met de wens slanker te zijn",
      "Ik denk aan calorieën verbranden tijdens beweging",
      "Anderen vinden dat ik te dun ben",
      "Ik denk veel na over vet in mijn lichaam",
      "Ik heb meer tijd nodig dan anderen om mijn maaltijden te eten",
      "Ik vermijd voedsel met suiker",
      "Ik eet dieet-voedsel",
      "Ik voel dat eten mijn leven beheerst",
      "Ik beheers mezelf rond eten",
      "Ik voel dat anderen me onder druk zetten om te eten",
      "Ik besteed te veel tijd aan eten en denken aan eten",
      "Ik voel me oncomfortabel na het eten van zoetigheden",
      "Ik volg een dieet",
      "Ik vind dat een lege maag prettig aanvoelt",
      "Ik geniet van het proberen van rijke nieuwe gerechten",
      "Ik heb de drang om te braken na de maaltijd",
    ],
    maxScore: 78,
    scoreFunction: sum,
    interpret: (s) => {
      if (s < 20) return { label: "Geen aanwijzingen verstoord eetgedrag", tier: "low" };
      return { label: "Aanwijzingen verstoord eetgedrag", tier: "high" };
    },
  },

  dast10: {
    id: "dast10",
    title: "DAST-10",
    subtitle: "Drugs-gebruik",
    category: "verslaving",
    description: "Tien vragen over drugsgebruik in het afgelopen jaar (exclusief alcohol en voorgeschreven medicatie).",
    questionCount: 10,
    estimatedMinutes: 2,
    source: "Skinner (1982)",
    freeTier: false,
    contextLabel: "in het afgelopen jaar",
    intro: "De volgende vragen gaan over je gebruik van drugs in het afgelopen jaar (NIET inclusief alcohol of voorgeschreven medicatie).",
    answerOptions: yesNoOptions,
    questions: [
      "Heb je drugs gebruikt anders dan voor medische redenen?",
      "Misbruik je voorgeschreven medicatie?",
      "Gebruik je meer dan één drug tegelijk?",
      "Kun je een week zonder drugs?",
      "Kun je je drugsgebruik altijd stoppen wanneer je dat wil?",
      "Heb je 'flashbacks' of black-outs gehad door drugs?",
      "Voel je je ooit slecht of schuldig over je drugsgebruik?",
      "Klaagt je partner of ouders over je betrokkenheid bij drugs?",
      "Heeft drugsgebruik problemen veroorzaakt tussen jou en je partner?",
      "Heb je illegale activiteiten ondernomen om aan drugs te komen?",
    ],
    reversedItems: [3, 4],
    maxScore: 10,
    scoreFunction: (a) => {
      const rev = [3, 4];
      return a.reduce((s, v, i) => s + (rev.includes(i) ? 1 - v : v), 0);
    },
    interpret: (s) => {
      if (s === 0) return { label: "Geen probleem", tier: "low" };
      if (s <= 2) return { label: "Laag", tier: "low" };
      if (s <= 5) return { label: "Matig", tier: "mid" };
      if (s <= 8) return { label: "Substantieel", tier: "high" };
      return { label: "Ernstig", tier: "high" };
    },
  },

  rrs10: {
    id: "rrs10",
    title: "RRS-10",
    subtitle: "Rumineren",
    category: "stemming",
    description: "Meet of je de neiging hebt om negatief te blijven malen bij neerslachtigheid.",
    questionCount: 10,
    estimatedMinutes: 2,
    source: "Treynor et al. (2003)",
    freeTier: false,
    intro: "Geef aan hoe vaak je elk doet wanneer je je verdrietig voelt.",
    answerOptions: [
      { value: 1, label: "Bijna nooit" },
      { value: 2, label: "Soms" },
      { value: 3, label: "Vaak" },
      { value: 4, label: "Bijna altijd" },
    ],
    questions: [
      "Denk je: 'Wat heb ik gedaan om dit te verdienen?'",
      "Denk je: 'Waarom reageer ik altijd zo?'",
      "Denk je: 'Waarom heb ik problemen die anderen niet hebben?'",
      "Denk je: 'Waarom kan ik dingen niet beter aanpakken?'",
      "Denk je over een recente situatie en wenst dat het beter was gegaan",
      "Ga je ergens alleen naartoe om over je gevoelens na te denken",
      "Schrijf je over hoe je je voelt en analyseer je het",
      "Analyseer je recente gebeurtenissen om te begrijpen waarom je verdrietig bent",
      "Ga je weg en denk je na over waarom je je zo voelt",
      "Denk je: 'Waarom heb ik zoveel problemen?'",
    ],
    maxScore: 40,
    scoreFunction: sum,
    subscaleScores: (a) => ({
      Brooding: [0, 1, 2, 3, 4].reduce((s, i) => s + a[i], 0),
      Reflectie: [5, 6, 7, 8, 9].reduce((s, i) => s + a[i], 0),
    }),
    interpret: (s) => {
      if (s <= 20) return { label: "Weinig rumineren", tier: "low" };
      if (s <= 28) return { label: "Matig rumineren", tier: "mid" };
      return { label: "Veel rumineren", tier: "high" };
    },
  },

  mdq: {
    id: "mdq",
    title: "MDQ",
    subtitle: "Bipolaire-screener",
    category: "stemming",
    description: "Screening op stemmingswisselingen die kenmerkend zijn voor bipolaire stoornissen.",
    questionCount: 15,
    estimatedMinutes: 4,
    source: "Hirschfeld et al. (2000)",
    freeTier: false,
    intro: "Heb je ooit een periode gehad waarin je niet je gewone zelf was, en…",
    questions: [
      { text: "… je je zo goed of zo opgewonden voelde dat anderen dachten dat je niet je gewone zelf was?", options: yesNoOptions } as QuestionWithOptions,
      { text: "… je zo geïrriteerd was dat je tegen mensen schreeuwde, ruzie maakte of vocht?", options: yesNoOptions } as QuestionWithOptions,
      { text: "… je je veel meer zelfvertrouwen voelde dan gewoonlijk?", options: yesNoOptions } as QuestionWithOptions,
      { text: "… je veel minder slaap nodig had dan gewoonlijk?", options: yesNoOptions } as QuestionWithOptions,
      { text: "… je veel meer praatte of sneller dan gewoonlijk?", options: yesNoOptions } as QuestionWithOptions,
      { text: "… gedachten door je hoofd raasden of je je gedachten niet kon vertragen?", options: yesNoOptions } as QuestionWithOptions,
      { text: "… je zo gemakkelijk werd afgeleid dat je moeite had je te concentreren?", options: yesNoOptions } as QuestionWithOptions,
      { text: "… je veel meer energie had dan gewoonlijk?", options: yesNoOptions } as QuestionWithOptions,
      { text: "… je veel actiever was dan gewoonlijk?", options: yesNoOptions } as QuestionWithOptions,
      { text: "… je veel socialer of uitgaander was dan gewoonlijk?", options: yesNoOptions } as QuestionWithOptions,
      { text: "… je veel meer geïnteresseerd was in seks dan gewoonlijk?", options: yesNoOptions } as QuestionWithOptions,
      { text: "… je dingen deed die ongewoon voor je waren of die anderen overmoedig of riskant vonden?", options: yesNoOptions } as QuestionWithOptions,
      { text: "… geld uitgeven jou of je familie in problemen bracht?", options: yesNoOptions } as QuestionWithOptions,
      { text: "Zijn meerdere van bovenstaande dingen tijdens dezelfde periode gebeurd?", options: yesNoOptions } as QuestionWithOptions,
      {
        text: "Hoeveel problemen heb je gehad door deze dingen?",
        options: [
          { value: 0, label: "Geen probleem" },
          { value: 1, label: "Klein probleem" },
          { value: 2, label: "Matig probleem" },
          { value: 3, label: "Ernstig probleem" },
        ],
      } as QuestionWithOptions,
    ],
    maxScore: 1,
    scoreFunction: (a) => {
      const yesCount = a.slice(0, 13).reduce((x, y) => x + y, 0);
      const sameTime = a[13];
      const problems = a[14];
      return yesCount >= 7 && sameTime === 1 && problems >= 2 ? 1 : 0;
    },
    interpret: (s) => {
      if (s === 0) return { label: "Negatieve screen", tier: "low" };
      return { label: "Positieve screen — verder onderzoek", tier: "high" };
    },
  },

  ubos: {
    id: "ubos",
    title: "UBOS",
    subtitle: "Burnout",
    category: "welzijn",
    description: "Utrechtse Burnout Schaal. Meet uitputting, distantie en competentie.",
    questionCount: 15,
    estimatedMinutes: 5,
    source: "Schaufeli & van Dierendonck (2000)",
    freeTier: false,
    contextLabel: "in de afgelopen weken",
    intro: "Geef voor elke uitspraak aan hoe vaak deze op jou van toepassing is in de afgelopen weken.",
    answerOptions: [
      { value: 0, label: "Nooit" },
      { value: 1, label: "Sporadisch" },
      { value: 2, label: "Af en toe" },
      { value: 3, label: "Regelmatig" },
      { value: 4, label: "Vaak" },
      { value: 5, label: "Heel vaak" },
      { value: 6, label: "Altijd" },
    ],
    questions: [
      "Ik voel me mentaal uitgeput",
      "Aan het einde van een werkdag voel ik me leeggepompt",
      "Ik voel me moe als ik 's ochtends opsta en ik weer een dag voor me heb",
      "Een hele dag werken vormt een zware belasting voor mij",
      "Ik voel me opgebrand door mijn werk",
      "Ik twijfel aan het nut van mijn werk",
      "Ik denk dat ik mijn werk te onpersoonlijk benader",
      "Ik merk dat ik te afstandelijk reageer op mensen die ik tegenkom",
      "Ik vind dat mijn werk goed is",
      "Ik kan goed inschatten hoe mensen die ik tegenkom zich voelen",
      "Ik draag op een effectieve manier bij aan het werk",
      "Ik vind dat ik veel waardevolle dingen bereik in mijn werk",
      "Ik voel me energiek aan het einde van een werkdag",
      "Ik kan gemakkelijk een ontspannen sfeer scheppen",
      "Ik kan emotionele problemen kalm afhandelen",
    ],
    maxScore: 90,
    scoreFunction: sum,
    subscaleScores: (a) => ({
      Uitputting: Number(([0, 1, 2, 3, 4].reduce((s, i) => s + a[i], 0) / 5).toFixed(1)),
      Distantie: Number(([5, 6, 7, 8].reduce((s, i) => s + a[i], 0) / 4).toFixed(1)),
      Competentie: Number(([9, 10, 11, 12, 13, 14].reduce((s, i) => s + a[i], 0) / 6).toFixed(1)),
    }),
    interpret: (_s, a) => {
      const arr = a as number[];
      const uitp = arr.slice(0, 5).reduce((x, y) => x + y, 0) / 5;
      const dist = arr.slice(5, 9).reduce((x, y) => x + y, 0) / 4;
      const comp = arr.slice(9, 15).reduce((x, y) => x + y, 0) / 6;
      const burnout = uitp >= 2.2 && dist >= 2.0 && comp <= 3.65;
      if (!burnout) return { label: "Geen burnout-indicatie", tier: "low" };
      if (uitp < 3) return { label: "Lichte burnout-indicatie", tier: "mid" };
      return { label: "Sterke burnout-indicatie", tier: "high" };
    },
  },
};

export const ASSESSMENT_LIST = Object.values(ASSESSMENTS);

export const CATEGORIES = [
  { id: "alle", label: "Alle" },
  { id: "stemming", label: "Stemming" },
  { id: "angst", label: "Angst" },
  { id: "adhd", label: "ADHD" },
  { id: "autisme", label: "Autisme" },
  { id: "borderline", label: "Borderline" },
  { id: "trauma", label: "Trauma" },
  { id: "ocd", label: "OCD" },
  { id: "eten", label: "Eten" },
  { id: "verslaving", label: "Verslaving" },
  { id: "sociaal", label: "Sociaal" },
  { id: "welzijn", label: "Welzijn" },
  { id: "persoonlijkheid", label: "Persoonlijkheid" },
];

export function getAssessment(id: string): Assessment | null {
  return ASSESSMENTS[id] ?? null;
}

export function getQuestionText(q: Question): string {
  if (typeof q === "string") return q;
  if ("options" in q) return q.text;
  return q.text;
}

export function getQuestionOptions(q: Question, fallback: AnswerOption[]): AnswerOption[] {
  if (typeof q === "string") return fallback;
  if ("options" in q && q.options) return q.options;
  return fallback;
}
