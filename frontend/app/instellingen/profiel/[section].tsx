import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeContext';
import { LAYERS } from '@/src/theme/tokens';

const BLAUW  = '#4A90E2';
const KORAAL = '#E85A5A';

const SECTION_CONFIG: Record<string, { title: string; icon: string; fields: Array<{ key: string; label: string; type: 'text' | 'email' | 'password' | 'switch'; placeholder?: string }> }> = {
  naam:          { title: 'Naam aanpassen', icon: '👤', fields: [{ key: 'voornaam', label: 'Voornaam', type: 'text', placeholder: 'jouw voornaam' }, { key: 'achternaam', label: 'Achternaam', type: 'text', placeholder: 'optioneel' }] },
  email:         { title: 'E-mailadres', icon: '📧', fields: [{ key: 'email', label: 'E-mail', type: 'email', placeholder: 'jouw@email.be' }] },
  wachtwoord:    { title: 'Wachtwoord', icon: '🔒', fields: [{ key: 'huidig', label: 'Huidig wachtwoord', type: 'password', placeholder: '••••••••' }, { key: 'nieuw', label: 'Nieuw wachtwoord', type: 'password', placeholder: '••••••••' }] },
  notificaties:  { title: 'Notificaties', icon: '🔔', fields: [{ key: 'dagelijks', label: 'Dagelijkse herinnering', type: 'switch' }, { key: 'tips', label: 'Welzijns-tips', type: 'switch' }, { key: 'community', label: 'Community berichten', type: 'switch' }] },
  privacy:       { title: 'Privacy', icon: '🛡️', fields: [{ key: 'analytics', label: 'Anonieme gebruiksdata', type: 'switch' }, { key: 'personalisatie', label: 'Persoonlijke aanbevelingen', type: 'switch' }] },
};

export default function SectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const { theme } = useTheme();
  const c = theme === 'dark' ? LAYERS.DARK : LAYERS.LIGHT;
  const router = useRouter();
  const config = SECTION_CONFIG[section || ''] || { title: section, icon: '⚙️', fields: [] };

  const [values, setValues] = useState<Record<string, any>>({});

  const save = () => { router.back(); };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <Stack.Screen options={{ title: config.title, headerShown: true }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: c.card }]}>
          {config.fields.map((field, i) => (
            <View key={field.key}>
              {field.type === 'switch' ? (
                <View style={styles.switchRow}>
                  <Text style={[styles.fieldLabel, { color: c.text }]}>{field.label}</Text>
                  <Switch
                    value={!!values[field.key]}
                    onValueChange={v => setValues(prev => ({ ...prev, [field.key]: v }))}
                    trackColor={{ true: BLAUW, false: c.border }}
                    thumbColor="#fff"
                  />
                </View>
              ) : (
                <View style={styles.inputWrap}>
                  <Text style={[styles.fieldLabel, { color: c.subtle }]}>{field.label}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]}
                    placeholder={field.placeholder}
                    placeholderTextColor={c.subtle}
                    secureTextEntry={field.type === 'password'}
                    keyboardType={field.type === 'email' ? 'email-address' : 'default'}
                    value={values[field.key] || ''}
                    onChangeText={v => setValues(prev => ({ ...prev, [field.key]: v }))}
                    autoCapitalize="none"
                  />
                </View>
              )}
              {i < config.fields.length - 1 && <View style={[styles.div, { backgroundColor: c.border }]} />}
            </View>
          ))}
        </View>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: BLAUW }]} onPress={save} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Opslaan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    borderRadius: 16, overflow: 'hidden', marginBottom: 24,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }, android: { elevation: 2 } }),
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, minHeight: 56 },
  inputWrap: { padding: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  div: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  saveBtn: { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
