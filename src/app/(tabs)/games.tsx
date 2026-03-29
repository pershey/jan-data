import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useSessionRepository } from '@/repositories/session-repository';
import { useGameRepository } from '@/repositories/game-repository';
import { SessionListItem } from '@/components/session/SessionListItem';
import { GameListItem } from '@/components/game/GameListItem';
import type { Session, Game } from '@/types';

export default function GamesScreen() {
  const router = useRouter();
  const sessionRepo = useSessionRepository();
  const gameRepo = useGameRepository();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionGameCounts, setSessionGameCounts] = useState<Record<number, number>>({});
  const [sessionIncomes, setSessionIncomes] = useState<Record<number, number>>({});
  const [standaloneGames, setStandaloneGames] = useState<Game[]>([]);

  const reload = useCallback(async () => {
    // セッション一覧
    const allSessions = await sessionRepo.getAll();
    setSessions(allSessions);

    // 各セッションの半荘数と合計収支
    const counts: Record<number, number> = {};
    const incomes: Record<number, number> = {};
    for (const s of allSessions) {
      const games = await gameRepo.getBySessionId(s.id);
      counts[s.id] = games.length;
      incomes[s.id] = games.reduce((sum, g) => sum + g.income, 0);
    }
    setSessionGameCounts(counts);
    setSessionIncomes(incomes);

    // 単発対局
    const standalone = await gameRepo.getStandalone();
    setStandaloneGames(standalone);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const isEmpty = sessions.length === 0 && standaloneGames.length === 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        {isEmpty && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              対局データがありません{'\n'}右下の「+」ボタンからセッションを開始しましょう
            </Text>
          </View>
        )}

        {/* セッション一覧 */}
        {sessions.length > 0 && (
          <View style={styles.sectionGroup}>
            <Text style={styles.sectionHeader}>セッション</Text>
            {sessions.map((s) => (
              <SessionListItem
                key={s.id}
                session={s}
                gameCount={sessionGameCounts[s.id] ?? 0}
                totalIncome={sessionIncomes[s.id] ?? 0}
                onPress={() => router.push(`/session/${s.id}`)}
              />
            ))}
          </View>
        )}

        {/* 単発対局 */}
        {standaloneGames.length > 0 && (
          <View style={styles.sectionGroup}>
            <Text style={styles.sectionHeader}>単発対局</Text>
            {standaloneGames.map((game) => (
              <GameListItem
                key={game.id}
                game={game}
                onPress={() => router.push(`/game/${game.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB: セッション作成 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/session/new')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionGroup: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
