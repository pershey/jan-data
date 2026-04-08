import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useStats } from '@/hooks/useStats';
import {
  useStatsSettings,
  STATS_ITEM_LABELS,
  type StatsItemKey,
} from '@/hooks/useStatsSettings';
import { formatPercent } from '@/utils/format';
import { RateChart } from '@/components/stats/RateChart';
import { IncomeChart } from '@/components/stats/IncomeChart';
import { CompatibilityTop3 } from '@/components/stats/CompatibilityTop3';

// 各指標のカラー定義
const STATS_COLORS: Record<StatsItemKey, string> = {
  winRate: '#E53935',
  dealInRate: '#1E88E5',
  callRate: '#FF6F00',
  riichiRate: '#7B1FA2',
  goshugiRate: '#00897B',
  akaRate: '#D32F2F',
  ippatsuRate: '#EF6C00',
  uraRate: '#6A1B9A',
};

export default function StatsScreen() {
  const { stats, games, reload } = useStats();
  const { settings, updateSetting } = useStatsSettings();
  const [showSettings, setShowSettings] = useState(false);

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

  // 表示する指標リスト
  const visibleItems: { key: StatsItemKey; value: number }[] = [];
  const allKeys: StatsItemKey[] = [
    'winRate', 'dealInRate', 'callRate', 'riichiRate',
    'goshugiRate', 'akaRate', 'ippatsuRate', 'uraRate',
  ];
  for (const key of allKeys) {
    if (settings[key]) {
      visibleItems.push({ key, value: stats[key] });
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 成績指標 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>成績指標</Text>
          <TouchableOpacity
            onPress={() => setShowSettings(!showSettings)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showSettings ? 'settings' : 'settings-outline'}
              size={20}
              color={showSettings ? Colors.primary : Colors.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* 表示設定パネル */}
        {showSettings && (
          <View style={styles.settingsPanel}>
            <Text style={styles.settingsTitle}>表示項目を選択</Text>
            {allKeys.map((key) => (
              <View key={key} style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>{STATS_ITEM_LABELS[key]}</Text>
                <Switch
                  value={settings[key]}
                  onValueChange={(value) => updateSetting(key, value)}
                  trackColor={{ true: STATS_COLORS[key] }}
                />
              </View>
            ))}
          </View>
        )}

        {/* 指標チャート */}
        {visibleItems.length > 0 ? (
          visibleItems.map(({ key, value }) => (
            <RateChart
              key={key}
              label={STATS_ITEM_LABELS[key]}
              value={value}
              color={STATS_COLORS[key]}
            />
          ))
        ) : (
          <Text style={styles.noItemsText}>
            表示する指標がありません。{'\n'}⚙ アイコンから表示項目を選択してください。
          </Text>
        )}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  // 表示設定パネル
  settingsPanel: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  settingsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  noItemsText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    paddingVertical: 8,
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
