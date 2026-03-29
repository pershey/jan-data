import { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { RATE_PRESETS, UMA_PRESETS } from '@/constants/mahjong';
import { formatDateTime, formatIncome } from '@/utils/format';
import { useSessionRepository } from '@/repositories/session-repository';
import { useGameRepository } from '@/repositories/game-repository';
import { GameListItem } from '@/components/game/GameListItem';
import type { Session, Game } from '@/types';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const sessionRepo = useSessionRepository();
  const gameRepo = useGameRepository();

  const [session, setSession] = useState<Session | null>(null);
  const [games, setGames] = useState<Game[]>([]);

  const loadData = useCallback(async () => {
    const sessionId = parseInt(id!, 10);
    if (isNaN(sessionId)) return;
    const s = await sessionRepo.getById(sessionId);
    setSession(s);
    if (s) {
      const g = await gameRepo.getBySessionId(sessionId);
      setGames(g);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function handleDelete() {
    Alert.alert('削除確認', 'このセッションを削除しますか？\n（半荘データはセッションから切り離されます）', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          if (session) {
            await sessionRepo.remove(session.id);
            router.back();
          }
        },
      },
    ]);
  }

  function handleEdit() {
    if (session) {
      router.push(`/session/edit/${session.id}`);
    }
  }

  function handleAddGame() {
    if (session) {
      router.push(`/game/new?sessionId=${session.id}`);
    }
  }

  if (!session) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>読み込み中...</Text>
      </View>
    );
  }

  // 集計
  const totalIncome = games.reduce((sum, g) => sum + g.income, 0);
  const incomeColor = totalIncome >= 0 ? Colors.positive : Colors.negative;

  // ラベル生成
  const rateLabel =
    RATE_PRESETS.find((p) => p.value === session.rate)?.label ??
    `${session.rate}円/1000点`;
  const umaPreset = UMA_PRESETS.find(
    (p) => p.big === session.umaBig && p.small === session.umaSmall
  );
  const umaLabel = umaPreset
    ? umaPreset.label
    : session.umaBig > 0
    ? `${session.umaSmall}-${session.umaBig}`
    : 'なし';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* セッション設定サマリー */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.sessionName}>
                {session.name || 'セッション'}
              </Text>
              <Text style={styles.dateText}>
                {formatDateTime(session.startedAt)}
              </Text>
            </View>
            <TouchableOpacity onPress={handleEdit} style={styles.editIconButton}>
              <Ionicons name="pencil" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsGrid}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>レート</Text>
              <Text style={styles.settingValue}>{rateLabel}</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>ウマ</Text>
              <Text style={styles.settingValue}>{umaLabel}</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>オカ</Text>
              <Text style={styles.settingValue}>
                {session.oka > 0 ? `${session.oka.toLocaleString()}点` : 'なし'}
              </Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>場代</Text>
              <Text style={styles.settingValue}>¥{session.gameFee.toLocaleString()}</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>トップ賞</Text>
              <Text style={styles.settingValue}>
                {session.topPrize > 0 ? `¥${session.topPrize.toLocaleString()}` : 'なし'}
              </Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>チップ</Text>
              <Text style={styles.settingValue}>
                {session.chipPrice > 0 ? `¥${session.chipPrice}/枚` : 'なし'}
              </Text>
            </View>
          </View>
        </View>

        {/* 収支合計 */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              合計収支（{games.length}半荘）
            </Text>
            <Text style={[styles.totalValue, { color: incomeColor }]}>
              ¥{formatIncome(totalIncome)}
            </Text>
          </View>
        </View>

        {/* 半荘リスト */}
        {games.length > 0 ? (
          <View style={styles.gamesSection}>
            <Text style={styles.sectionTitle}>半荘一覧</Text>
            {games.map((game) => (
              <GameListItem
                key={game.id}
                game={game}
                onPress={() => router.push(`/game/${game.id}`)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyGames}>
            <Text style={styles.emptyText}>
              まだ半荘が記録されていません{'\n'}
              下の「+」ボタンから追加しましょう
            </Text>
          </View>
        )}

        {/* 編集・削除ボタン */}
        <TouchableOpacity style={styles.editFullButton} onPress={handleEdit}>
          <Ionicons name="pencil" size={18} color={Colors.primary} />
          <Text style={styles.editFullText}>セッション設定を編集</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>このセッションを削除</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 半荘追加FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddGame}
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
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  editIconButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: Colors.background,
  },
  settingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  settingItem: {
    width: '47%',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    gap: 2,
  },
  settingLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  totalCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  gamesSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  emptyGames: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  editFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  editFullText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.danger,
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
