import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { formatPercent } from '@/utils/format';
import type { MahjongStats } from '@/types';

interface Props {
  stats: MahjongStats;
}

export function StatsOverview({ stats }: Props) {
  if (stats.totalRounds === 0) return null;

  const items = [
    { label: '和了率', value: stats.winRate, color: '#E53935' },
    { label: '放銃率', value: stats.dealInRate, color: '#1E88E5' },
    { label: '副露率', value: stats.callRate, color: '#FF6F00' },
    { label: '立直率', value: stats.riichiRate, color: '#7B1FA2' },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={[styles.value, { color: item.color }]}>
            {formatPercent(item.value)}
          </Text>
          <Text style={styles.rounds}>{stats.totalRounds}局</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
  rounds: {
    fontSize: 11,
    color: Colors.textLight,
  },
});
