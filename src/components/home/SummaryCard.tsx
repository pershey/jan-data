import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { formatIncome } from '@/utils/format';

interface Props {
  avgIncome: number;
  totalIncome: number;
  totalGames: number;
}

export function SummaryCard({ avgIncome, totalIncome, totalGames }: Props) {
  const incomeColor = avgIncome >= 0 ? Colors.positive : Colors.negative;

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>半荘あたりの収支期待値</Text>
      <Text style={[styles.value, { color: incomeColor }]}>
        {totalGames > 0 ? `¥${formatIncome(Math.round(avgIncome))}` : '---'}
      </Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>総収支</Text>
          <Text
            style={[
              styles.itemValue,
              {
                color:
                  totalIncome >= 0 ? Colors.positive : Colors.negative,
              },
            ]}
          >
            ¥{formatIncome(totalIncome)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.item}>
          <Text style={styles.itemLabel}>対局数</Text>
          <Text style={styles.itemValue}>{totalGames}半荘</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    gap: 2,
  },
  itemLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
});
