import { useCallback } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useStats } from '@/hooks/useStats';
import { formatPercent } from '@/utils/format';
import { RateChart } from '@/components/stats/RateChart';
import { IncomeChart } from '@/components/stats/IncomeChart';
import { CompatibilityTop3 } from '@/components/stats/CompatibilityTop3';

export default function StatsScreen() {
  const { stats, games, reload } = useStats();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  if (stats.totalGames === 0) {
    return (
      <View style={[styles.container, styles.empty]}>
        <Text style={styles.emptyText}>
          対局データがありません{'\n'}データを入力すると統計が表示されます
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 各種率 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>成績指標</Text>
        <RateChart label="和了率" value={stats.winRate} color="#E53935" />
        <RateChart label="放銃率" value={stats.dealInRate} color="#1E88E5" />
        <RateChart label="副露率" value={stats.callRate} color="#FF6F00" />
        <RateChart label="立直率" value={stats.riichiRate} color="#7B1FA2" />
      </View>

      {/* 順位分布 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>順位分布</Text>
        <Text style={styles.avgRank}>
          平均順位: {stats.avgRank.toFixed(2)}
        </Text>
        <View style={styles.rankRow}>
          {stats.rankDistribution.map((count, i) => (
            <View key={i} style={styles.rankItem}>
              <Text style={styles.rankLabel}>{i + 1}着</Text>
              <Text style={styles.rankCount}>{count}回</Text>
              <Text style={styles.rankRate}>
                {formatPercent(stats.totalGames > 0 ? count / stats.totalGames : 0)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 収支推移 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>収支推移</Text>
        <IncomeChart games={games} />
      </View>

      {/* 相性ベスト3（コンペモード、5戦以上の相手がいる場合のみ表示） */}
      <CompatibilityTop3 />
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
    paddingBottom: 32,
  },
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
  avgRank: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rankRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rankItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  rankLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  rankCount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  rankRate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
