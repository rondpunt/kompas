import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeContext';
import { LAYERS } from '@/src/theme/tokens';

const BLAUW  = '#4A90E2';
const GROEN  = '#7ED957';
const KORAAL = '#E85A5A';

const MOCK_CHATS = [
  { id: '1', name: 'Sofie V.', preview: 'Heb je die oefening ook geprobeerd?', time: '14:32', unread: 2, color: BLAUW },
  { id: '2', name: 'Thomas D.', preview: 'Super fijn gesprek vandaag, dankjewel!', time: '12:10', unread: 0, color: GROEN },
  { id: '3', name: 'Emma B.', preview: 'Ik snap wat je bedoelt met die grounding...', time: 'Gisteren', unread: 1, color: KORAAL },
];

export default function InboxScreen() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? LAYERS.DARK : LAYERS.LIGHT;
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ title: 'Berichten', headerShown: true }} />
      <FlatList
        data={MOCK_CHATS}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: colors.border }]} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { backgroundColor: colors.card }]}
            onPress={() => router.push('/community/' + item.id)}
            activeOpacity={0.75}
          >
            <View style={[styles.avatar, { backgroundColor: item.color + '20' }]}>
              <Text style={styles.avatarLetter}>{item.name[0]}</Text>
            </View>
            <View style={styles.content}>
              <View style={styles.topRow}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.time, { color: colors.subtle }]}>{item.time}</Text>
              </View>
              <View style={styles.bottomRow}>
                <Text style={[styles.preview, { color: colors.subtle }]} numberOfLines={1}>{item.preview}</Text>
                {item.unread > 0 && (
                  <View style={[styles.badge, { backgroundColor: BLAUW }]}>
                    <Text style={styles.badgeText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 16, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 4 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarLetter: { fontSize: 20, fontWeight: '700', color: '#1A1F36' },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 15, fontWeight: '600' },
  time: { fontSize: 12 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  preview: { flex: 1, fontSize: 13 },
  badge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  sep: { height: StyleSheet.hairlineWidth },
});
