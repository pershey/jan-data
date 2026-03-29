import { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useOpponentRepository } from '@/repositories/opponent-repository';
import type { Opponent } from '@/types';

// 直前の操作を追跡して取り消しに使用
interface LastAction {
  opponentId: number;
  type: 'win' | 'loss';
}

export default function CompeteScreen() {
  const navigation = useNavigation();
  const repo = useOpponentRepository();
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);

  const loadData = useCallback(async () => {
    const all = await repo.getAll();
    // 勝率の高い順にソート（同率なら対戦数が多い方が上）
    all.sort((a, b) => {
      const rateA = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : -1;
      const rateB = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : -1;
      if (rateB !== rateA) return rateB - rateA;
      return (b.wins + b.losses) - (a.wins + a.losses);
    });
    setOpponents(all);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // ヘッダー右に追加ボタンを設定
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleAdd}
          style={{ padding: 4, marginRight: 8 }}
        >
          <Ionicons name="add" size={28} color={Colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // 対戦相手を追加
  function handleAdd() {
    if (Platform.OS === 'web') {
      // Web用: window.prompt
      const name = window.prompt('対戦相手の名前を入力');
      if (name && name.trim()) {
        addOpponent(name.trim());
      }
    } else {
      Alert.prompt(
        '対戦相手を追加',
        '名前を入力してください',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '追加',
            onPress: (name?: string) => {
              if (name && name.trim()) {
                addOpponent(name.trim());
              }
            },
          },
        ],
        'plain-text'
      );
    }
  }

  async function addOpponent(name: string) {
    await repo.create(name);
    setLastAction(null);
    await loadData();
  }

  // 勝ち +1
  async function handleWin(id: number) {
    await repo.incrementWins(id);
    setLastAction({ opponentId: id, type: 'win' });
    await loadData();
  }

  // 負け +1
  async function handleLoss(id: number) {
    await repo.incrementLosses(id);
    setLastAction({ opponentId: id, type: 'loss' });
    await loadData();
  }

  // 直前操作の取り消し
  async function handleUndo(id: number) {
    if (!lastAction || lastAction.opponentId !== id) return;
    if (lastAction.type === 'win') {
      await repo.decrementWins(id);
    } else {
      await repo.decrementLosses(id);
    }
    setLastAction(null);
    await loadData();
  }

  // 長押し → 編集/削除メニュー
  function handleLongPress(opponent: Opponent) {
    Alert.alert(
      opponent.name,
      undefined,
      [
        {
          text: '名前を変更',
          onPress: () => {
            if (Platform.OS === 'web') {
              const newName = window.prompt('新しい名前', opponent.name);
              if (newName && newName.trim()) {
                renameOpponent(opponent.id, newName.trim());
              }
            } else {
              Alert.prompt(
                '名前を変更',
                undefined,
                [
                  { text: 'キャンセル', style: 'cancel' },
                  {
                    text: '変更',
                    onPress: (name?: string) => {
                      if (name && name.trim()) {
                        renameOpponent(opponent.id, name.trim());
                      }
                    },
                  },
                ],
                'plain-text',
                opponent.name
              );
            }
          },
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '削除確認',
              `${opponent.name}を削除しますか？`,
              [
                { text: 'キャンセル', style: 'cancel' },
                {
                  text: '削除',
                  style: 'destructive',
                  onPress: async () => {
                    await repo.remove(opponent.id);
                    if (lastAction?.opponentId === opponent.id) {
                      setLastAction(null);
                    }
                    await loadData();
                  },
                },
              ]
            );
          },
        },
        { text: 'キャンセル', style: 'cancel' },
      ]
    );
  }

  async function renameOpponent(id: number, name: string) {
    await repo.updateName(id, name);
    await loadData();
  }

  // 勝率を計算
  function getWinRate(o: Opponent): string {
    const total = o.wins + o.losses;
    if (total === 0) return '---';
    return ((o.wins / total) * 100).toFixed(1) + '%';
  }

  // 勝率に応じた色
  function getWinRateColor(o: Opponent): string {
    const total = o.wins + o.losses;
    if (total === 0) return Colors.textSecondary;
    const rate = o.wins / total;
    if (rate >= 0.6) return Colors.positive;
    if (rate < 0.4) return Colors.negative;
    return Colors.textSecondary;
  }

  function renderItem({ item }: { item: Opponent }) {
    const canUndo = lastAction?.opponentId === item.id;

    return (
      <TouchableOpacity
        style={styles.card}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.8}
        delayLongPress={500}
      >
        {/* 上段: 名前 + 勝率 */}
        <View style={styles.cardHeader}>
          <Text style={styles.opponentName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.winRate, { color: getWinRateColor(item) }]}>
            {getWinRate(item)}
          </Text>
        </View>

        {/* 中段: 戦績 */}
        <Text style={styles.record}>
          {item.wins}勝 - {item.losses}敗
          {item.wins + item.losses > 0 &&
            `（${item.wins + item.losses}戦）`}
        </Text>

        {/* 下段: 操作ボタン */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.winButton]}
            onPress={() => handleWin(item.id)}
          >
            <Ionicons name="arrow-up" size={14} color={Colors.white} />
            <Text style={styles.actionButtonText}>+勝</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.lossButton]}
            onPress={() => handleLoss(item.id)}
          >
            <Ionicons name="arrow-down" size={14} color={Colors.white} />
            <Text style={styles.actionButtonText}>+敗</Text>
          </TouchableOpacity>

          {canUndo && (
            <TouchableOpacity
              style={[styles.actionButton, styles.undoButton]}
              onPress={() => handleUndo(item.id)}
            >
              <Ionicons name="arrow-undo" size={14} color={Colors.textSecondary} />
              <Text style={styles.undoButtonText}>取消</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={opponents}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={
          opponents.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Ionicons name="people-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>
              対戦相手がいません{'\n'}右上の＋ボタンで追加してください
            </Text>
          </View>
        }
      />
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
    gap: 12,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opponentName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  winRate: {
    fontSize: 24,
    fontWeight: '800',
  },
  record: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  winButton: {
    backgroundColor: Colors.positive,
  },
  lossButton: {
    backgroundColor: Colors.negative,
  },
  undoButton: {
    backgroundColor: Colors.divider,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  undoButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
