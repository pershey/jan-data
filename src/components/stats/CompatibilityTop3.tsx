import { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useOpponentRepository } from '@/repositories/opponent-repository';
import type { Opponent } from '@/types';

// 順位メダル
const MEDALS = ['🥇', '🥈', '🥉'];
// 最低対戦数フィルタ
const MIN_GAMES = 5;

export function CompatibilityTop3() {
  const repo = useOpponentRepository();
  const [top3, setTop3] = useState<Opponent[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadTop3();
    }, [])
  );

  async function loadTop3() {
    const all = await repo.getAll();
    // 5戦以上の相手のみ対象、勝率の高い順ソート
    const qualified = all
      .filter((o) => o.wins + o.losses >= MIN_GAMES)
      .sort((a, b) => {
        const rateA = a.wins / (a.wins + a.losses);
        const rateB = b.wins / (b.wins + b.losses);
        if (rateB !== rateA) return rateB - rateA;
        return (b.wins + b.losses) - (a.wins + a.losses);
      })
      .slice(0, 3);
    setTop3(qualified);
  }

  if (top3.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>相性ベスト3</Text>
      {top3.map((o, i) => {
        const total = o.wins + o.losses;
        const rate = ((o.wins / total) * 100).toFixed(1);
        const rateColor = o.wins / total >= 0.6
          ? Colors.positive
          : o.wins / total < 0.4
          ? Colors.negative
          : Colors.textSecondary;

        return (
          <View key={o.id} style={styles.row}>
            <Text style={styles.medal}>{MEDALS[i]}</Text>
            <Text style={styles.name} numberOfLines={1}>{o.name}</Text>
            <Text style={[styles.rate, { color: rateColor }]}>{rate}%</Text>
            <Text style={styles.games}>（{total}戦）</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
  },
  medal: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  rate: {
    fontSize: 16,
    fontWeight: '700',
  },
  games: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
