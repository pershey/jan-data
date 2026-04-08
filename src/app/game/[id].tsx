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
import { ROUND_RESULTS, RATE_PRESETS, UMA_PRESETS } from '@/constants/mahjong';
import { RankBadge } from '@/components/ui/Badge';
import { formatDateTime, formatIncome, formatScore } from '@/utils/format';
import { useGameRepository } from '@/repositories/game-repository';
import { useRoundRepository } from '@/repositories/round-repository';
import type { Game, Round } from '@/types';

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const gameRepo = useGameRepository();
  const roundRepo = useRoundRepository();

  const [game, setGame] = useState<Game | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);

  const loadData = useCallback(async () => {
    const gameId = parseInt(id!, 10);
    if (isNaN(gameId)) return;
    const g = await gameRepo.getById(gameId);
    setGame(g);
    if (g) {
      const r = await roundRepo.getByGameId(gameId);
      setRounds(r);
    }
  }, [id]);

  // 編集から戻ってきた時にデータをリロード
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function handleDelete() {
    Alert.alert('削除確認', 'この対局を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          if (game) {
            await gameRepo.remove(game.id);
            router.back();
          }
        },
      },
    ]);
  }

  function handleEdit() {
    if (game) {
      router.push(`/game/edit/${game.id}`);
    }
  }

  if (!game) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>読み込み中...</Text>
      </View>
    );
  }

  const incomeColor = game.income >= 0 ? Colors.positive : Colors.negative;
  const isSessionGame = game.sessionId !== null;

  const rateLabel =
    RATE_PRESETS.find((p) => p.value === game.rate)?.label ??
    `${game.rate}円/1000点`;

  // ウマラベル
  const umaPreset = UMA_PRESETS.find(
    (p) => p.big === game.umaBig && p.small === game.umaSmall
  );
  const umaLabel = umaPreset
    ? umaPreset.label
    : game.umaBig > 0
    ? `${game.umaSmall}-${game.umaBig}`
    : 'なし';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 半荘サマリー */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.dateText}>
            {formatDateTime(game.playedAt)}
          </Text>
          <View style={styles.headerRight}>
            <RankBadge rank={game.rank} />
            <TouchableOpacity onPress={handleEdit} style={styles.editIconButton}>
              <Ionicons name="pencil" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {isSessionGame ? (
          <>
            {/* セッション配下: 収支とチップのみ */}
            <View style={styles.incomeHighlight}>
              <Text style={styles.infoLabel}>収支</Text>
              <Text style={[styles.incomeHighlightValue, { color: incomeColor }]}>
                ¥{formatIncome(game.income)}
              </Text>
            </View>
            {game.chipCount !== 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>チップ</Text>
                  <Text style={styles.detailValue}>
                    {game.chipCount > 0 ? '+' : ''}{game.chipCount}枚
                    {game.chipPrice > 0 && `（¥${formatIncome(game.chipCount * game.chipPrice)}）`}
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <>
            {/* 単発対局: 全情報を表示 */}
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>レート</Text>
                <Text style={styles.infoValue}>{rateLabel}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>素点</Text>
                <Text style={styles.infoValue}>{formatScore(game.rawScore)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>場代</Text>
                <Text style={styles.infoValue}>¥{game.gameFee.toLocaleString()}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>収支</Text>
                <Text style={[styles.infoValue, styles.incomeText, { color: incomeColor }]}>
                  ¥{formatIncome(game.income)}
                </Text>
              </View>
            </View>

            {/* ウマオカ・チップ詳細 */}
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>ウマ</Text>
                <Text style={styles.detailValue}>{umaLabel}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>オカ</Text>
                <Text style={styles.detailValue}>
                  {game.oka > 0 ? `${game.oka.toLocaleString()}点` : 'なし'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>チップ</Text>
                <Text style={styles.detailValue}>
                  {game.chipCount !== 0
                    ? `${game.chipCount > 0 ? '+' : ''}${game.chipCount}枚`
                    : 'なし'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>チップ単価</Text>
                <Text style={styles.detailValue}>
                  {game.chipPrice > 0 ? `¥${game.chipPrice}` : '-'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>トップ賞</Text>
                <Text style={styles.detailValue}>
                  {game.topPrize > 0 ? `¥${game.topPrize.toLocaleString()}` : 'なし'}
                </Text>
              </View>
              {game.tobisho > 0 && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>トビ賞</Text>
                  <Text style={styles.detailValue}>
                    ¥{game.tobisho.toLocaleString()}
                    {game.tobishoReceived > 0 ? `（獲得${game.tobishoReceived}回）` : ''}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>

      {/* 局一覧 */}
      {rounds.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>局データ（{rounds.length}局）</Text>
          {rounds.map((r) => (
            <View key={r.id} style={styles.roundItem}>
              <Text style={styles.roundNumber}>{r.roundNumber}局</Text>
              <View
                style={[
                  styles.resultBadge,
                  { backgroundColor: ROUND_RESULTS[r.result].color },
                ]}
              >
                <Text style={styles.resultText}>
                  {ROUND_RESULTS[r.result].label}
                </Text>
              </View>
              {r.riichi && <Text style={styles.tag}>リーチ</Text>}
              {r.hasCall && (
                <Text style={styles.tag}>鳴き</Text>
              )}
              {(r.hasAka || r.hasIppatsu || r.hasUra) && (
                <Text style={styles.tag}>
                  {[r.hasAka && '赤', r.hasIppatsu && '一発', r.hasUra && '裏'].filter(Boolean).join('/')}
                </Text>
              )}
              {r.chipDelta !== 0 && (
                <Text
                  style={[
                    styles.tag,
                    { color: r.chipDelta > 0 ? Colors.positive : Colors.negative },
                  ]}
                >
                  チップ{r.chipDelta > 0 ? '+' : ''}{r.chipDelta}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* 編集・削除ボタン */}
      <TouchableOpacity style={styles.editFullButton} onPress={handleEdit}>
        <Ionicons name="pencil" size={18} color={Colors.primary} />
        <Text style={styles.editFullText}>この対局を編集</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>この対局を削除</Text>
      </TouchableOpacity>
    </ScrollView>
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
    paddingBottom: 40,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
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
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editIconButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: Colors.background,
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoItem: {
    width: '47%',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  incomeText: {
    fontSize: 18,
  },
  incomeHighlight: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  incomeHighlightValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    width: '47%',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  roundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
  },
  roundNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 36,
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  tag: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.divider,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
});
