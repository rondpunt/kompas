import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { OB, OBFonts } from './ob-theme';

interface QuizConfig {
  progress: string;
  question: string;
  options: string[];
  multiSelect: boolean;
  subtext?: string;
}

interface Props {
  config: QuizConfig;
  onAnswer: (value: string | string[]) => void;
  onSkip: () => void;
}

export function QuizStep({ config, onAnswer, onSkip }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (opt: string) => {
    if (config.multiSelect) {
      setSelected((prev) =>
        prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
      );
    } else {
      // Single select — auto-advance
      onAnswer(opt);
    }
  };

  const handleNext = () => {
    if (selected.length > 0) onAnswer(selected);
    else onSkip();
  };

  const [num, total] = config.progress.split('/').map(Number);
  const progress = num / total;

  return (
    <SafeAreaView style={s.root}>
      {/* Progress bar */}
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.stepLabel}>{config.progress} van 3</Text>
        <Text style={s.question}>{config.question}</Text>
        {config.subtext ? <Text style={s.subtext}>{config.subtext}</Text> : null}

        <View style={s.options}>
          {config.options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                style={[s.card, isSelected && s.cardSelected]}
                onPress={() => toggle(opt)}
                activeOpacity={0.75}
              >
                {config.multiSelect && (
                  <View style={[s.checkbox, isSelected && s.checkboxSelected]}>
                    {isSelected && <Feather name="check" size={13} color={OB.white} />}
                  </View>
                )}
                <Text style={[s.cardText, isSelected && s.cardTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {config.multiSelect && (
        <View style={s.ctaWrap}>
          <TouchableOpacity
            style={[s.ctaBtn, selected.length === 0 && s.ctaBtnDisabled]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={s.ctaText}>Verder</Text>
            <Feather name="arrow-right" size={16} color={OB.white} />
          </TouchableOpacity>
          <TouchableOpacity style={s.skipBtn} onPress={onSkip}>
            <Text style={s.skipText}>Liever overslaan</Text>
          </TouchableOpacity>
        </View>
      )}
      {!config.multiSelect && (
        <View style={s.ctaWrap}>
          <TouchableOpacity style={s.skipBtn} onPress={onSkip}>
            <Text style={s.skipText}>Liever overslaan</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

export const QUIZ_INTENT: QuizConfig = {
  progress: '1/3',
  question: 'Waar hoop je op vandaag?',
  options: [
    'Gewoon praten over hoe ik me voel',
    'Een moeilijke situatie verwerken',
    'Begrijpen waarom ik me zo voel',
    'Hulp bij iets waar ik mee worstel',
    'Checken hoe het echt met me gaat',
    'Anders, of weet ik nog niet',
  ],
  multiSelect: true,
};

export const QUIZ_MOOD: QuizConfig = {
  progress: '2/3',
  question: 'Hoe zou je je gemoedsrust de laatste weken omschrijven?',
  options: [
    'Overwegend rustig, met af en toe piekmomenten',
    'Wisselend – goede en moeilijke dagen door elkaar',
    'Vaak onrustig of gespannen',
    'Overwegend zwaar of uitgeput',
    'Wil ik liever niet zeggen',
  ],
  multiSelect: false,
  subtext: 'Dit helpt om het gesprek af te stemmen op waar je nu staat.',
};

export const QUIZ_THERAPY: QuizConfig = {
  progress: '3/3',
  question: 'Heb je ervaring met therapie of professionele hulp?',
  options: [
    'Ja, ik ga momenteel',
    'Ja, in het verleden',
    'Nee, maar ik overweeg het',
    'Nee, en dat is nu niet aan de orde',
    'Liever niet zeggen',
  ],
  multiSelect: false,
  subtext:
    'Kompas is geen vervanging voor therapie, maar kan wel ondersteunen tussen sessies door of helpen je gedachten te ordenen.',
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB.bg },
  progressTrack: { height: 2, backgroundColor: OB.border, width: '100%' },
  progressFill: { height: 2, backgroundColor: OB.accent },
  scroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 100 },
  stepLabel: { fontSize: 12, color: OB.accent, fontWeight: '600', letterSpacing: 0.6, marginBottom: 16 },
  question: {
    fontSize: 26, fontWeight: '500', lineHeight: 34, color: OB.textPrimary,
    fontStyle: 'italic',
    fontFamily: Platform.select({ ios: OBFonts.serif, android: 'serif' }),
    marginBottom: 12,
  },
  subtext: { fontSize: 13, color: OB.textMuted, marginBottom: 24, lineHeight: 19 },
  options: { gap: 10, marginTop: 8 },
  card: {
    backgroundColor: OB.surface, borderWidth: 1, borderColor: OB.border,
    borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
    minHeight: 56,
  },
  cardSelected: { borderColor: OB.accent, backgroundColor: OB.accentSoft },
  cardText: { fontSize: 15, color: OB.textSecondary, flex: 1, lineHeight: 21 },
  cardTextSelected: { color: OB.textPrimary },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    borderColor: OB.textFaint, alignItems: 'center', justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: OB.accent, borderColor: OB.accent },
  ctaWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12,
    backgroundColor: OB.bg,
  },
  ctaBtn: {
    height: 54, borderRadius: 16, backgroundColor: OB.accent,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaText: { fontSize: 16, fontWeight: '600', color: OB.white },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 13, color: OB.textMuted },
});
